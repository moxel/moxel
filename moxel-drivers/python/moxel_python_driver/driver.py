#!/usr/bin/env python
from __future__ import print_function
# Python driver to start models.
# Wraps a model using a flask server.
from flask import Flask, jsonify, request
from moxel.space import Image, String, JSON
import argparse
import json
import random
import subprocess
from base64 import b64encode
import os
from os.path import abspath, expanduser, exists, relpath, join, dirname


VERSION='0.0.1'
GCS_MOUNT = '/mnt/cloudfs'

def decode_single_input(data, input_type):
    if input_type == 'Image':
        return Image.from_base64(data)
    elif input_type == 'String':
        return String().from_str(data)
    elif input_type == 'JSON':
        return JSON.from_object(data)


def decode_inputs(input_raw, input_space):
    input_moxel = {}
    for k, v in input_space.items():
        data = input_raw[k]
        input_moxel[k] = decode_single_input(data, v)
    return input_moxel


def encode_single_output(output_obj, output_type):
    if output_type == 'Image':
        return output_obj.to_base64()
    elif output_type == 'String':
        return output_obj.to_str()
    elif output_type == 'JSON':
        return output_obj.to_object()


def encode_outputs(output_moxel, output_space):
    output_raw = {}
    for var_name, output_type in output_space.items():
        output_obj = output_moxel[var_name]
        output_raw[var_name] = encode_single_output(output_obj, output_type)
    return output_raw


def switch_to_work_path(code_root, work_path):
    root = abspath(expanduser(code_root))
    os.chdir(root)
    os.chdir(work_path)


def load_predict_func(module, name):
    import sys
    sys.path.append('./')

    import importlib
    module = importlib.import_module(module)
    predict_func = getattr(module, name)

    return predict_func


def mount_asset(key, local_path):
    print('{} -> {}'.format(key, local_path))
    local_dir = dirname(local_path)
    if local_dir and not exists(local_dir): os.makedirs(local_dir)
    subprocess.check_output('ln -fs {} {}'
                            .format(join(GCS_MOUNT, key), local_path),
                            shell=True)


def main():
    print('Python driver version {}'.format(VERSION))


    parser = argparse.ArgumentParser()
    parser.add_argument('--json', type=str)
    args = parser.parse_args()

    config = json.loads(args.json)

    code_root = config.get('code_root', './')
    asset_root = config.get('asset_root', '')
    work_path = config.get('work_path', './')

    entrypoint = config['entrypoint']
    input_space = config['input_space']
    output_space = config['output_space']
    assets = config.get('assets', [])

    switch_to_work_path(code_root, work_path)

    if not exists('.git'):
        raise Exception('This is not a valid git repository: {}'.format(root))

    if len(assets) > 0:
        print('Mounting assets...')
    for asset in assets:
        asset_path = relpath(join(work_path, asset), '.')
        mount_asset(asset_path, asset_path)


    [predict_file_name, predict_func_name] = entrypoint.split('::')

    if predict_file_name.endswith('.py'):
        predict_file_name = predict_file_name[:-3]

    predict_func = load_predict_func(predict_file_name, predict_func_name)

    print('Loaded prediction function', predict_func)

    app = Flask(__name__)

    @app.route('/', methods=['GET'])
    def healthcheck():
        return 'OK'

    @app.route('/', methods=['POST'])
    def predict():
        input_raw = request.json
        input_moxel = decode_inputs(input_raw, input_space)
        output_moxel = predict_func(input_moxel)
        return jsonify(encode_outputs(output_moxel, output_space))

    app.run(port=5900, host='0.0.0.0')

if __name__ == '__main__':
    exit(main())
