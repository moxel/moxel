# warp CLI
# notice methods here are not re-entrant.
import click
import os
import sys
import yaml
import requests
import requests.exceptions
import dateparser
from os.path import join, abspath, exists, relpath, getsize, dirname

sys.path.append('./')

import warpcli
from warpcli.constants import model_id
from warpcli.local import Repo, Deployment
from warpcli.remote import MasterRemote
from warpcli.utils import (load_yaml, dump_yaml, query_yes_no, mkdir_if_not_exists,
                           ProgressBar, SpinCursor)


def current_user():
    # TODO: For MVP, we do not have a user system.
    return "dummy"


def current_repo_dir():
    repo_dir = abspath('./')
    # search for .git in ancestor dirs.
    while not exists(join(repo_dir, '.git')):
        if repo_dir == '/': return None
        repo_dir = abspath(join(repo_dir, '..'))
    return repo_dir


@click.group()
def cli(): pass


@cli.command()
@click.option('--config_file', '-f', type=str, default='dummy.yml', help='Dummy config to deploy')
def upload(config_file):
    """
    Note: paths in yaml is relative to the yaml file.
    """
    # Load meta config.
    root = current_repo_dir()
    path = relpath(os.getcwd(), start=current_repo_dir())
    user = current_user()
    remote = MasterRemote()

    # Gather local file information.
    repo = Repo(root)
    config_path = join(os.getcwd(), config_file)
    deploy = Deployment(root, config_path)
    print('Uploading model: "{}"'.format(model_id(user, deploy.name, deploy.tag)))

    # Check to see if model already exists.
    status_code = remote.ping_model(user, deploy.name, deploy.tag)
    if status_code == 200:
        print('The model "{}" already exists'.format(model_id(user, deploy.name, deploy.tag)))
        exit(1)

    # Push code.
    try:
        remote_url = remote.get_repo_url(user, deploy.name)
        print('Push code => {}'.format(remote_url))
    except requests.exceptions.ConnectionError as e:
        print('Error: Unable to connect to the server.')
        exit(1)

    commit = repo.push(remote_url)
    print('Commit:', commit)

    # Push data.
    cloud = 'gcloud'

    # Calculate total asset sizes.
    total_size = 0.
    for asset in deploy.assets:
        file_path = os.path.join(root, deploy.work_path, asset)
        total_size += getsize(file_path)

        if total_size >= 1e9:
            unit = 'GB'
            denom = 1e9
        elif total_size >= 1e6:
            unit = 'MB'
            denom = 1e6
        elif total_size >= 1e3:
            unit = 'KB'
            denom = 1e3
        else:
            unit = 'B'
            denom = 1

    # Upload the assets.
    bar = ProgressBar(round(total_size / denom, 1), title='Uploading:', unit=unit)
    bar.update(0.)
    accum_size = 0.

    class UploadByChunks(object):
        def __init__(self, filename, chunksize=1 << 13):
            self.filename = filename
            self.chunksize = chunksize
            self.totalsize = os.path.getsize(filename)
            self.readsofar = 0

        def __iter__(self):
            with open(self.filename, 'rb') as file:
                while True:
                    data = file.read(self.chunksize)
                    if not data:
                        sys.stderr.write("\n")
                        break
                    self.readsofar += len(data)
                    bar.update(round(accum_size + self.readsofar / denom, 1),
                               max_value=round(self.totalsize / denom, 1))
                    yield data

        def __len__(self):
            return self.totalsize

    for asset in deploy.assets:
        file_path = os.path.join(root, deploy.work_path, asset)
        asset_path = relpath(file_path, start=root)

        asset_remote_path = join(user, deploy.name, commit, asset_path)
        asset_url = remote.get_asset_url(user, deploy.name,
                                         cloud, 'PUT', asset_remote_path)

        response = requests.put(asset_url, UploadByChunks(join(root, file_path)),
                                headers={
                                    'Content-Type': 'application/octet-stream'
                                })

        accum_size += getsize(file_path)
        bar.update(round(accum_size / denom, 1))

    # Register model.
    response = remote.put_model(user, deploy.name, deploy.tag, commit, deploy.yaml)
    if response.status_code == 200:
        print('Model has been successfully uploaded!')
    else:
        print('Error: {}'.format(response.text))



@cli.command()
@click.argument('model_id', type=str)
def deploy(model_id):
    name, tag = model_id.split(':')
    user = current_user()
    remote = MasterRemote()

    print('Deploying model {}/{}:{}'.format(user, name, tag))
    response = remote.deploy_model(user, name, tag)
    print(response)


