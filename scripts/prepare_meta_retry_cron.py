#!/usr/bin/env python3
"""Render a disabled, idempotent retry-cron proposal. Never installs or runs it."""
import argparse
from pathlib import PurePosixPath
import shlex


def absolute(value):
    path = PurePosixPath(value)
    if not path.is_absolute() or '..' in path.parts or any(c in value for c in '\n\r\x00%'):
        raise argparse.ArgumentTypeError('Use an absolute path without parent segments, controls or cron %')
    return value


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('php', 'env-file', 'worker', 'lock-file'):
        parser.add_argument('--' + name, required=True, type=absolute)
    args = parser.parse_args()
    command = ['flock', '-n', args.lock_file, 'env', 'GHL_ENV_FILE=' + args.env_file, args.php, args.worker]
    print('# DISABLED. Separate owner approval and retention/withdrawal review required.')
    print('# */5 * * * * ' + shlex.join(command))
    print('# Review/merge/install manually only after approval; never flush or rewrite event_time.')


if __name__ == '__main__':
    main()
