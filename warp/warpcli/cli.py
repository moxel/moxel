# warp CLI
# notice methods here are not re-entrant.
import click
import os
import sys
import yaml
import dateparser
from os.path import join, abspath, exists, relpath, getsize

sys.path.append('./')

import warpcli
from warpcli.code import Repo
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
    root = current_repo_dir()
    path = relpath(os.getcwd(), start=current_repo_dir())
    user = current_user()

    repo = Repo(root)
    commit = repo.push(user)
