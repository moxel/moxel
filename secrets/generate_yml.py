import base64
import os

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

with open('credentials.yml', 'w') as f:
    f.write(yml)
