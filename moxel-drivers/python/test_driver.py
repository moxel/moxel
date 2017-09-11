import json
import os
from flask import Flask, jsonify, request


config = {
    'entrypoint': 'serve.py::predict',
    'input_space': {
        'seed': 'String'
    },
    'output_space': {
        'number': 'String'
    }
}

print(json.dumps(config))

os.environ['PYTHONPATH'] = os.environ['PYTHONPATH'] + ':../../moxel-clients/python'
os.system('cd ../../examples/py-foo && {}/driver.py --json "{}"'.format(os.getcwd(), json.dumps(config).replace('\"', '\\\"')))


