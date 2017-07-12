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

    def put_model(self, user, name, tag, commit, yaml):
        response = requests.put(master_server_http('/model/{}/{}/{}'.format(user, name, tag)),
                              json={
                                  'commit': commit,
                                  'yaml': yaml
                              })
        return response

    def ping_model(self, user, name, tag):
        """ Check to see if the model to be deployed already exists.
        """
        response = requests.post(master_server_http('/model/{}/{}/{}'.format(user, name, tag)),
                                 json={
                                     'action': 'ping'
                                 })
        return response.status_code

    def deploy_model(self, user, name, tag):
        response = requests.post(master_server_http('/model/{}/{}/{}'.format(user, name, tag)),
                                 json={
                                     'action': 'deploy'
                                 })
        return response



