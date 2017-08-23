import requests
import simplejson

from moxel.utils import parse_model_id, parse_space_dict
from moxel.constants import API_ENDPOINT, MODEL_ENDPOINT


class Model(object):
    def __init__(self, model_id):
        """
        Initialize the model with moxel model_id in format
        <user>/<model>:<tag>
        """
        (self.user, self.model, self.tag) = parse_model_id(model_id)

        data = requests.get(API_ENDPOINT +
                            '/users/{user}/models/{model}/{tag}'.format(
                                user=self.user, model=self.model, tag=self.tag)
                            ).json()

        self.status = data.get('status', 'UNKNOWN')

        if self.status != 'LIVE':
            raise Exception('Model must be LIVE to be used')

        self.metadata = data.get('metadata', {})


        self.input_space = parse_space_dict(self.metadata['input_space'])
        self.output_space = parse_space_dict(self.metadata['output_space'])
        print(self.input_space)
        print(self.output_space)

    def predict(self, kwargs):
        # Wrap input.
        input_dict = {}
        for var_name, var_space in self.input_space.items():
            assert var_name in kwargs, 'Input must have argument {}'.format(var_name)
            # Type check.
            assert (type(kwargs[var_name]) == var_space,
                'Type does not match for {}'.format(var_name))

            # Assume base64 encoding.
            # Only works for Image now.
            input_object = kwargs[var_name].to_base64()
            input_dict[var_name] = input_object

        # Make HTTP REST request.
        raw_result = requests.post(MODEL_ENDPOINT +
                        '/{user}/{model}/{tag}'.format(
                            user=self.user, model=self.model, tag=self.tag
                        ),
                        json=input_dict
                    )
        try:
            result = raw_result.json()
        except simplejson.scanner.JSONDecodeError:
            raise Exception('Cannot decode JSON')

        # Parse result.
        output_dict = {}
        for var_name, var_space in self.output_space.items():
            assert var_name in result, 'Output must have argument {}'.format(var_name)

            output_object = var_space.from_base64(result[var_name])
            output_dict[var_name] = output_object

        return output_dict










