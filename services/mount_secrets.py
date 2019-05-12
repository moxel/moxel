# Mount secrets from kube to local.
import subprocess
import yaml
import os
import base64

result = subprocess.check_output('kubectl get secret credentials -o yaml', shell=True)
result = yaml.load(result)

data = result.get('data')

assert data

try:
    os.mkdir('/tmp/moxel_credentials')
except:
    pass

for k, v in data.items():
    with open('/tmp/moxel_credentials/' + k, 'w') as f:
        f.write(base64.b64decode(v).decode('utf-8'))


