import os
from os.path import abspath, dirname, join

import warpcli


CONTEXT = os.environ.get('WARP_CONTEXT', 'local')
WARP_CONFIG = 'dummy.yml'
WARP_USER = 'warp'

GIT_SSH_COMMAND = 'ssh -i {}/secrets/warpdrive'.format(abspath(join(dirname(warpcli.__file__), '..')))
MASTER_URL = 'master-dev.dummy.ai'
MASTER_PORT = 8080

def master_server_http(path):
    return 'http://' + MASTER_URL + ':{}'.format(MASTER_PORT) + path

def model_id(user, name, tag):
    return '{}/{}:{}'.format(user, name, tag)
