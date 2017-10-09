#!/usr/bin/env python
from __future__ import print_function
# Python driver to start models.
# Wraps a model using a flask server.
from flask import Flask, jsonify, request
from moxel.space import encode_json, decode_json, get_space
import argparse
import json
import random
import subprocess
from base64 import b64encode
import os, sys
from os.path import abspath, expanduser, exists, relpath, join, dirname


VERSION='0.0.2'
GCS_MOUNT = '/mnt/cloudfs'


def decode_single_input(data, input_type):
    if input_type == 'Image':
        return Image.from_base64(data)
    elif input_type == 'String':
        return String.from_str(data)
    elif input_type == 'JSON':
        return JSON.from_object(data)
    elif input_type == 'Array':
        return Array.from_list(json.loads(data))
    else:
        raise Exception('Unknown input type: {}'.format(input_type))


def decode_inputs(input_raw, input_space_strs):
    return decode_json(input_raw, get_space(input_space_strs))
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
    elif output_type == 'Array':
        return json.dumps(output_obj.to_list())
    else:
        raise Exception('Unknown output type: {}'.format(output_type))


def encode_outputs(output_moxel, output_space_strs):
    return encode_json(output_moxel, get_space(output_space_strs))

    output_raw = {}
    for var_name, output_type in output_space.items():
        output_type = get_space(output_type)
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
    # Clear argv in case user module parses arguments
    # https://github.com/moxel/moxel/issues/117
    sys.argv[1:] = []

    code_root = config.get('code_root', './')
    asset_root = config.get('asset_root', '')
    work_path = config.get('work_path', './')

    entrypoint = config['entrypoint']
    input_space = config['input_space']
    output_space = config['output_space']
    assets = config.get('assets', [])
    setup = config.get('setup', [])

    switch_to_work_path(code_root, work_path)

    # Mount assets.
    if len(assets) > 0:
        print('Mounting assets...')
    for asset in assets:
        asset_path = relpath(join(code_root, work_path, asset), code_root)
        mount_asset(asset_path, asset)

    # Run setup commands.
    for command in setup:
        ret = os.system(command)
        if ret != 0: exit(ret)

    # Load predict function.
    [predict_file_name, predict_func_name] = entrypoint.split('::')

    if predict_file_name.endswith('.py'):
        predict_file_name = predict_file_name[:-3]

    predict_func = load_predict_func(predict_file_name, predict_func_name)

    print('Loaded prediction function', predict_func)

    # Start flask server.
    app = Flask(__name__)

    @app.route('/', methods=['GET'])
    def healthcheck():
        return jsonify({
            'status': 'OK',
            'type': 'python',
            'version': VERSION
        })

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': str(e)}), 500

    @app.route('/', methods=['POST'])
    def predict():
        input_raw = request.json
        input_moxel = decode_inputs(input_raw, input_space)
        output_moxel = predict_func(**input_moxel)
        return jsonify(encode_outputs(output_moxel, output_space))

    app.run(port=5900, host='0.0.0.0')


if __name__ == '__main__':
    exit(main())
