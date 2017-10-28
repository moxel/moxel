#!/usr/bin/env python
import distutils.sysconfig
import os
import re
import shutil
import subprocess
import sys
import sysconfig


class BuildException(Exception):
    pass


def main(command, args=[]):
    try:
        return build(command, args=args)
    except BuildException as e:
        sys.exit(e)


def build(command='build', args=[]):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    if command == 'clean':
        # Clear .build
        if os.path.exists('.build'):
            shutil.rmtree('.build')
    else:
        # Run a new build
        env = {}

        # set up temporary gopath
        if not os.path.exists('.build'):
            os.makedirs(os.path.normpath('.build/src/github.com/dummy-ai/mvp'))

        if not os.path.exists('.build/src/github.com/dummy-ai/mvp/moxel'):
            os.symlink('../../../../..', '.build/src/github.com/dummy-ai/mvp/moxel')

        env['GOPATH'] = os.path.join(os.getcwd(), '.build')
        env['go15vendorexperiment'] = '1' # needed on go 1.5, no-op on go 1.6+

        for k, v in env.items():
            print("export {}='{}'".format(k, v))
            os.environ[k] = v

        if command == 'install':
            os.system('cd .build/src/github.com/dummy-ai/mvp/moxel && go get -t && go install')
            # Use custom go-git
            # os.system('cd .build/src/gopkg.in/src-d/go-git.v4 && (git remote add -f dummy https://github.com/dummy-ai/go-git || git pull dummy v4)')

        elif command == 'build-debug':
            cmd = 'go build -i -o bin/moxel github.com/dummy-ai/mvp/moxel'
            try:
                subprocess.check_call(cmd.split())
                return 0
            except subprocess.CalledProcessError:
                return 1

        elif command == 'build-release':
            cmd = 'go build -i -o bin/moxel github.com/dummy-ai/mvp/moxel'
            try:
                subprocess.check_call(['go', 'build', '-i',
                                      '-ldflags', '-s -w',
                                      '-o', 'bin/moxel', 'github.com/dummy-ai/mvp/moxel'])
                return 0
            except subprocess.CalledProcessError:
                return 1

        elif command == 'test':
            cmd = 'go test -v {}'.format(' '.join(args))
            try:
                subprocess.check_call(cmd.split())
            except subprocess.CalledProcessError:
                return 1


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: ./test.py [command: install/build/clean]')
        exit(1)

    command = sys.argv[1]
    exit(main(command, args=sys.argv[2:]))
