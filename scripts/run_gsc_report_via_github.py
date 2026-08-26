#!/usr/bin/env python3
"""Run the keyless GSC report in GitHub Actions and download its artifact.

The workflow authenticates through GitHub OIDC and Google Workload Identity
Federation. This local runner needs only the existing GitHub CLI login. It does
not read, print, or store Google access tokens and has no publication path.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
import time
import uuid
from pathlib import Path

WORKFLOW = "gsc-opportunity-report.yml"
REPOSITORY = "D1360tx/JoaoCrusBJJ"


def run(command: list[str], *, timeout: int = 120) -> str:
    completed = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if completed.returncode:
        detail = (completed.stderr or completed.stdout).strip()
        raise RuntimeError(f"{' '.join(command[:3])} failed: {detail}")
    return completed.stdout


def find_run(rows: list[dict], request_id: str) -> dict | None:
    expected = f"Joao GSC report {request_id}"
    return next((row for row in rows if row.get("displayTitle") == expected), None)


def wait_for_run(request_id: str, deadline: float) -> dict:
    while time.monotonic() < deadline:
        raw = run([
            "gh", "run", "list", "--repo", REPOSITORY,
            "--workflow", WORKFLOW, "--event", "workflow_dispatch",
            "--limit", "30", "--json",
            "databaseId,displayTitle,status,conclusion,url",
        ])
        row = find_run(json.loads(raw), request_id)
        if row:
            if row.get("status") == "completed":
                return row
        time.sleep(5)
    raise TimeoutError("Timed out waiting for the GitHub Actions GSC report")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--timeout", type=int, default=600)
    args = parser.parse_args()

    request_id = uuid.uuid4().hex
    deadline = time.monotonic() + args.timeout
    run([
        "gh", "workflow", "run", WORKFLOW, "--repo", REPOSITORY,
        "--ref", "main", "-f", f"request_id={request_id}",
    ])
    row = wait_for_run(request_id, deadline)
    if row.get("conclusion") != "success":
        raise RuntimeError(
            f"GitHub Actions report failed ({row.get('conclusion')}): {row.get('url')}"
        )

    artifact = f"joao-gsc-{request_id}"
    with tempfile.TemporaryDirectory(prefix="joao-gsc-") as directory:
        run([
            "gh", "run", "download", str(row["databaseId"]),
            "--repo", REPOSITORY, "--name", artifact, "--dir", directory,
        ], timeout=180)
        source = Path(directory) / "joao-gsc-opportunities.md"
        if not source.is_file() or source.stat().st_size == 0:
            raise RuntimeError("The completed workflow returned no report artifact")
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_bytes(source.read_bytes())

    print(f"Wrote {args.output} from {row.get('url')}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, TimeoutError, subprocess.TimeoutExpired, json.JSONDecodeError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
