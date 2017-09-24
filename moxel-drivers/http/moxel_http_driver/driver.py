#!/usr/bin/env python
""" Runtime for docker containers.
"""
from __future__ import print_function
import os
import sys
import time
import argparse
from os.path import join, abspath, dirname, expanduser, exists, relpath
import yaml
import pexpect
import subprocess

DAEMON_VERSION = '0.0.1'

print('HTTP Driver: {}'.format(DAEMON_VERSION))

parser = argparse.ArgumentParser()
parser.add_argument('--code_root', default='/code', type=str)
parser.add_argument('--asset_root', default='', type=str)
parser.add_argument('--work_path', default='./', type=str)
parser.add_argument('--assets', nargs='*', default=[], type=str)
parser.add_argument('--cmd', nargs='*', default=[], type=str)

args = parser.parse_args()

root = args.code_root
root = abspath(expanduser(root))

def mount_asset(key, local_path):
    GCS_MOUNT = '/mnt/cloudfs'

    local_dir = dirname(local_path)
    if local_dir and not exists(local_dir): os.makedirs(local_dir)
    subprocess.check_output('ln -fs {} {}'
                            .format(join(GCS_MOUNT, key), local_path),
                            shell=True)


# Verify this is a Git repository
if not exists(join(root, '.git')):
    print('[daemon] This is not a valid git repository: {}'.format(root))
    exit(1)

os.chdir(args.code_root)

print(args)
for asset in args.assets:
    asset_path = relpath(join(args.work_path, asset), '.')
    print(asset_path)
    mount_asset(asset_path, asset_path)

print('[daemon] Running command {}'.format(' '.join(args.cmd)))
sys.stdout.flush() # make sure daemon outputs finish

os.chdir(args.work_path)

for command in args.cmd:
    ret = os.system(command)
    if ret != 0: exit(ret)

