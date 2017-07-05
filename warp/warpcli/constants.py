import os
from os.path import abspath, dirname, join

import warpcli


CONTEXT = os.environ.get('WARP_CONTEXT', 'local')
WARP_CONFIG = 'dummy.yml'
WARP_USER = 'warp'

GIT_SSH_COMMAND = 'ssh -i {}/secrets/warpdrive'.format(abspath(join(dirname(warpcli.__file__), '..')))
GIT_REGISTRY = 'git.dummy.ai:/mnt/code'


def project_remote_dir(user, name):
    return '/{}/{}'.format(user, name)


def git_remote_url(user, name):
    return 'ssh://{}@{}/{}'.format(WARP_USER, GIT_REGISTRY, project_remote_dir(user, name))

