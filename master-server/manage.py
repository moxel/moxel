#!/usr/bin/env python
import distutils.sysconfig
import os
import numpy
import re
import shutil
import subprocess
import sys
import sysconfig


class BuildException(Exception):
    pass


def main(command, args=[]):
    try:
        build(command, args=args)
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
            os.symlink('../../../../..', '.build/src/github.com/dummy-ai/mvp/master-server')

        env['GOPATH'] = os.path.join(os.getcwd(), '.build')
        env['go15vendorexperiment'] = '1' # needed on go 1.5, no-op on go 1.6+

        for k, v in env.items():
            print("export {}='{}'".format(k, v))
            os.environ[k] = v


        if command == 'install':
            os.system('cd .build/src/github.com/dummy-ai/mvp/master-server && go get')

        elif command == 'build':
            cmd = 'go build -o bin/master-server github.com/dummy-ai/mvp/master-server'
            subprocess.call(cmd.split())

        elif command == 'test':
            cmd = 'go test -v {}'.format(' '.join(args))
            subprocess.call(cmd.split())


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: ./test.py [command: install/build/clean]')
        exit(1)

    command = sys.argv[1]
    main(command, args=sys.argv[2:])
