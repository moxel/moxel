import os

MOXEL_ENV = os.environ.get('MOXEL_ENV', 'prod')

if MOXEL_ENV == 'prod':
    MOXEL_ENDPOINT = 'http://beta.moxel.ai'
elif MOXEL_ENV == 'dev':
    MOXEL_ENDPOINT = 'http://dev.moxel.ai'
elif MOXEL_ENV == 'local':
    MOXEL_ENDPOINT = 'http://localhost:8080'
else:
    raise Exception('Unknown MOXEL_ENV = {}'.format(MOXEL_ENV))

# Not an endpoint to real moxel server, but to local mock server.
# Used for serving models locally.
LOCALHOST_ENDPOINT = 'http://localhost:8081'

