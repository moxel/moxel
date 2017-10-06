import requests
import json, simplejson

from moxel.utils import parse_model_id
from moxel.space.utils import parse_space_dict, encode_json, decode_json
from moxel.constants import MOXEL_ENDPOINT, MOXEL_DEV_ENDPOINT, LOCALHOST_ENDPOINT
import moxel.space as space


class Model(object):
    def __init__(self, model_id, where='moxel'):
        """
        Initialize the model with moxel model_id in format
        Args:
            model_id - <user>/<model>:<tag>
            where - can be "moxel" or "localhost" depending where the model is served.
        """
        (self.user, self.model, self.tag) = parse_model_id(model_id)

        if where == 'moxel':
            self.endpoint = MOXEL_ENDPOINT
        elif where == 'dev':
            self.endpoint = MOXEL_DEV_ENDPOINT
        elif where == 'localhost':
            self.endpoint = LOCALHOST_ENDPOINT

        self.api_endpoint = self.endpoint + '/api'
        self.model_endpoint = self.endpoint + '/model'

        response = requests.get(self.api_endpoint +
                            '/users/{user}/models/{model}/{tag}'.format(
                                user=self.user, model=self.model, tag=self.tag)
                            )

        if response.status_code == 200:
            data = response.json()
        else:
            raise Exception(response.text)

        self.status = data.get('status', 'UNKNOWN')

        if self.status != 'LIVE':
            raise Exception('Model must be LIVE to be used')

        self.metadata = data.get('metadata', {})
        self.spec = data.get('spec', {})

        self.input_space = parse_space_dict(self.spec['input_space'])
        self.output_space = parse_space_dict(self.spec['output_space'])

    def ping(self):
        text = requests.get(self.model_endpoint +
                        '/{user}/{model}/{tag}'.format(
                            user=self.user, model=self.model, tag=self.tag
                        )
                    ).text
        return text == 'OK'


    def predict(self, *args, **kwargs):
        if len(args) > 0:
            raise Exception('Moxel does not support positional arguments yet.')

        # Wrap input.
        input_dict = encode_json(kwargs, self.input_space)

        # Make HTTP REST request.
        response = requests.post(self.model_endpoint +
                        '/{user}/{model}/{tag}'.format(
                            user=self.user, model=self.model, tag=self.tag
                        ),
                        json=input_dict
                    )

        raw_result = response.text

        if response.status_code == 200:
            result = json.loads(raw_result)
        elif response.status_code == 500:
            result = json.loads(raw_result)
            raise Exception('[Error from model] ' + result.get('error', 'Unknown error'))
        else:
            raise Exception('[Error from model] ' + response.text)

        # Parse result.
        return decode_json(result, self.output_space)










