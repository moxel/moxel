# warp CLI
# notice methods here are not re-entrant.
import click
import os
import sys
import yaml
import requests
import dateparser
from os.path import join, abspath, exists, relpath, getsize

sys.path.append('./')

import warpcli
from warpcli.local import Repo
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
def upload():
    # Load meta config.
    root = current_repo_dir()
    path = relpath(os.getcwd(), start=current_repo_dir())
    user = current_user()
    remote = MasterRemote()
    repo = Repo(root)
    print('{}:{}'.format(repo.name, repo.version))

    # Push code.
    remote_url = remote.get_repo_url(user, repo.name)
    print('Push code => {}'.format(remote_url))
    commit = repo.push(remote_url)

    # Push data.
    cloud = 'gcloud'

    # calculate total size.
    total_size = 0.
    for asset in repo.assets:
        file_path = os.path.join(root, asset)
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

    bar = ProgressBar(round(total_size / denom, 1), title='Uploading', unit=unit)

    for asset in repo.assets:
        asset_remote_path = join(user, repo.name, commit, asset)
        asset_url = remote.get_asset_url(user, repo.name,
                                         cloud, 'PUT', asset_remote_path)
        with open(asset, 'rb') as f:
            response = requests.put(asset_url, f.read(),
                                    headers={
                                        'Content-Type': 'application/octet-stream'
                                    })

        accum_size = 0.
        file_path = os.path.join(root, asset)
        accum_size += getsize(file_path)
        bar.update(round(accum_size / denom, 1))



