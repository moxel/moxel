import requests

from moxel.utils import parse_model_id
from moxel.constants import API_ENDPOINT


class Model(object):
    def __init__(self, model_id):
        """
        Initialize the model with moxel model_id in format
        <user>/<model>:<tag>
        """
        (user, model, tag) = parse_model_id(model_id)

        data = requests.get(API_ENDPOINT +
                            '/users/{user}/models/{model}/{tag}'.format(
                                user=user, model=model, tag=tag)
                            ).json()

        self.status = data.get('status', 'UNKNOWN')

        if self.status != 'LIVE':
            raise Exception('Model must be LIVE to be used')

        self.metadata = data.get('metadata', {})



