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

API_ENDPOINT = MOXEL_ENDPOINT + '/api'
MODEL_ENDPOINT = MOXEL_ENDPOINT + '/model'
