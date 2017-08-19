import os

MOXEL_ENV = os.environ.get('MOXEL_ENV', 'prod')

if MOXEL_ENV == 'prod':
    API_ENDPOINT = 'http://beta.moxel.ai/api'
elif MOXEL_ENV == 'dev':
    API_ENDPOINT = 'http://dev.moxel.ai/api'
elif MOXEL_ENV == 'local':
    API_ENDPOINT = 'http://localhost:8080'
else:
    raise Exception('Unknown MOXEL_ENV = {}'.format(MOXEL_ENV))


