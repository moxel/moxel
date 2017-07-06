"""
Remote endpoint to interact with master server.
"""
import requests
from contextlib import closing

from warpcli.constants import master_server_http


class MasterRemote(object):
    """ Remote to master
    """
    def get_repo_url(self, user, name):
        response = requests.get(master_server_http('/url/code'),
                        params={'user': user, 'name': name}).json()
        return response.get('url')

    def get_asset_url(self, user, name, cloud, verb, path):
        response = requests.get(master_server_http('/url/data'),
                        params={
                            'user': user, 'name': name,
                            'cloud': cloud, 'verb': verb,
                            'path': path
                        }).json()
        return response.get('url')

