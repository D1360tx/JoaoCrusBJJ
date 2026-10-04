#!/usr/bin/env python3
"""Required local release job: exact Git SHA, native PHP, real Chromium, no egress.
Dependency/browser installation is a separate preflight, never a test fallback.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sha', default='HEAD')
parser.add_argument('--evidence', required=True, type=Path)
parser.add_argument('--php', default=os.environ.get('JOAO_TEST_PHP'))
parser.add_argument('--python', default=os.environ.get('JOAO_TEST_PYTHON'))
args = parser.parse_args()
repo = Path(__file__).resolve().parents[1]
if not args.php or not args.python:
    parser.error('--php and --python (native PHP 8 CLI and pinned bridge venv) required')
sha = subprocess.check_output(['git', 'rev-parse', args.sha + '^{commit}'], cwd=repo, text=True).strip()
out = args.evidence.resolve()
if out.is_relative_to(repo):
    parser.error('Evidence must be outside the repository')
out.mkdir(parents=True, exist_ok=False, mode=0o700)
archive = out / 'archive'
archive.mkdir(mode=0o700)
with subprocess.Popen(['git', 'archive', sha], cwd=repo, stdout=subprocess.PIPE) as source:
    subprocess.run(['tar', '-x', '-C', str(archive)], stdin=source.stdout, check=True)
    assert source.wait() == 0
# Full tests import the declared, installed QA dependency. No fake modules/skips.
(archive / 'node_modules').symlink_to(repo / 'node_modules', target_is_directory=True)
env = {'PATH': os.environ['PATH'], 'HOME': os.environ['HOME'],
       'JOAO_TEST_PHP': str(Path(args.php).resolve()), 'PHP_BINARY': str(Path(args.php).resolve())}
proof = "import socket; from pathlib import Path; interfaces=Path('/proc/net/dev').read_text(); route=Path('/proc/net/route').read_text(); assert len(route.strip().splitlines())==1; assert all('lo:' in s for s in interfaces.splitlines()[2:]); assert socket.socket().connect_ex(('1.1.1.1',443))==101; print('PASS: loopback only, no routes, outbound ENETUNREACH')"
commands = [
    ('network-proof', ['python3', '-c', proof]),
    ('playwright-version', ['node', '-e', "const v=require('playwright/package.json').version; if(v!==require('./package.json').devDependencies.playwright)throw Error('QA dependency mismatch'); console.log(v)"]),
    ('native-php', [env['JOAO_TEST_PHP'], '-n', '-r', "if(PHP_SAPI!=='cli'||PHP_MAJOR_VERSION<8)exit(1); echo PHP_VERSION,PHP_EOL;"]),
    ('preview-build-validator', ['npm', 'run', 'build']),
    ('preview-node', ['sh', '-c', 'node --test tests/*.test.js']),
    ('production-seo', ['python3', 'scripts/apply_seo_foundation.py', '--mode', 'production']),
    ('production-build', ['python3', 'scripts/build_vercel_site.py', '--production']),
    ('production-validator', ['python3', 'scripts/validate_vercel_build.py', '--production']),
    ('production-node', ['sh', '-c', 'node --test tests/*.test.js']),
    ('python', [os.path.abspath(args.python), '-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_*.py']),
    ('php-lint', ['sh', '-c', 'for file in dist/api/*.php; do "$PHP_BINARY" -n -l "$file" || exit; done']),
    ('js-syntax', ['sh', '-c', 'node --check site/assets/campaign-site.js && node --check site/assets/program-fit-quiz.js && node --check site/assets/austin-program-fit-quiz.js']),
]
results = []
for name, command in commands:
    result = subprocess.run(['unshare', '-Urn', *command], cwd=archive, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    log = out / (name + '.log')
    log.write_text(result.stdout)
    log.chmod(0o600)
    results.append({'name': name, 'command': command, 'exit': result.returncode})
    (out / 'results.json').write_text(json.dumps({'sha': sha, 'results': results}, indent=2))
    print(name, result.returncode, result.stdout[-350:], flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
print('RELEASE_TESTS_PASS', sha, out)
