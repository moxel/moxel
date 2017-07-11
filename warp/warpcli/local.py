# manage local Git repository.
import os
import yaml
import uuid
import random
from progressive.bar import Bar
from git import Remote, Repo as GitRepo, RemoteProgress, IndexFile
from os.path import dirname, relpath

from warpcli.constants import GIT_SSH_COMMAND, WARP_CONFIG
from warpcli.utils import load_yaml, dump_yaml


class PushProgressPrinter(RemoteProgress):
    memes = ['Taking us to warp speed', 'Jumping into hyperspace']

    def __init__(self):
        super(PushProgressPrinter, self).__init__()
        self.progress_bar = None
        self.meme = None

    def update(self, op_code, cur_count, max_count=None, message=''):
        # print(op_code, cur_count, max_count, cur_count / (max_count or 100.0), message or "NO MESSAGE")
        if max_count:
            if not self.progress_bar:
                self.progress_bar = Bar(max_value=max_count, title='Sync:')
                self.progress_bar.cursor.clear_lines(2)
                self.progress_bar.cursor.save()
                self.meme = random.choice(self.memes)

            self.progress_bar.cursor.restore()
            self.progress_bar.max_value = max_count
            self.progress_bar.draw(cur_count)


class Repo(object):
    """ Manages a local git repository.
    """
    def __init__(self, path):
        self.path = path
        self.git_repo = GitRepo(self.path)
        self.git_command = GIT_SSH_COMMAND


    def push(self, git_remote_url):
        """ sync the staged files to remote """
        with self.git_repo.git.custom_environment(GIT_SSH_COMMAND=self.git_command):
            # create a diff again working copy
            diffs = self.git_repo.index.diff(None)
            # create a commit with staged changes.
            commit = self.git_repo.index.commit('', head=False)
            index = IndexFile.from_tree(self.git_repo, commit.hexsha)
            # add working copy patch to the new commit.
            for diff in diffs:
                if diff.b_mode == 0 and diff.b_blob is None:
                    index.remove(items=[diff.a_blob.path])
                else:
                    index.add(items=[diff.a_blob.path])
            commit = index.commit('', head=False)
            # push commits as a branch.
            branch = remote = None
            try:
                branch = self.git_repo.create_head('branch-' + commit.hexsha, commit.hexsha)
                remote_id = str(uuid.uuid4())[:10]
                remote = self.git_repo.create_remote(remote_id, url=git_remote_url)
                remote.push(branch, progress=PushProgressPrinter())
            finally:
                # clean up.
                # print(branch)
                if branch: self.git_repo.delete_head(branch, force=True)
                if remote: self.git_repo.delete_remote(remote)

        return commit.hexsha


class Deployment(object):
    def __init__(self, repo_root, config_path):
        self.config_path = config_path
        self.config = load_yaml(config_path)
        self.name = self.config.get('name')
        self.version = self.config.get('version')
        self.assets = self.config.get('assets', [])
        self.work_path = relpath(dirname(config_path), start=repo_root)


