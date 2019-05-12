import base64
import sys
import os

if len(sys.argv) < 2:
    print('Usage: python generate_yml.py [prod | dev]')
    exit(1)

env = sys.argv[1]

if env != 'prod' and env != 'dev':
    print('Error: env must be [prod | dev], not', env)
    exit(1)

store = {
    'AUTH0_DOMAIN': 'dummyai.auth0.com',
    'AUTH0_CLIENT_ID': os.environ.get('AUTH0_CLIENT_ID'),
    'AUTH0_CLIENT_SECRET': os.environ.get('AUTH0_CLIENT_SECRET'),
    'SENDGRID_API_KEY': os.environ.get('SENDGRID_API_KEY')
}

# Check Auth0 Secrets
assert store.get('AUTH0_CLIENT_ID')
assert store.get('AUTH0_CLIENT_SECRET')

# Check SendGrid API Key
assert store.get('SENDGRID_API_KEY')

# Add environment specific databases.
if env == 'prod':
    store['DBAddress'] = '35.197.24.27'
    store['DBPassword'] = 'postgres'
    store['RedisDBAddress'] = '35.203.139.111'
    store['RedisDBPassword'] = 'RKe3DcnXeCLJ'
elif env == 'dev':
    store['DBAddress'] = '35.185.221.185'
    store['DBPassword'] = 'postgres'
    store['RedisDBAddress'] = '35.203.154.15'
    store['RedisDBPassword'] = 'zqYT1YVPsEBr'

store_encoded = {k: base64.b64encode(v.encode('utf-8')) for (k, v) in store.items()}

yml = '''apiVersion: v1
kind: Secret
metadata:
  name: credentials
type: Opaque
data:
'''

for k, v in store_encoded.items():
    yml += '  %s: %s\n' % (k, v.decode('ascii'))

print(yml)

with open('credentials-%s.yml' % env, 'w') as f:
    f.write(yml)
