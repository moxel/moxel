from .core import Space

import json


class JSON(Space):
    NAME = 'JSON'

    def __init__(self, data):
        self.data = data

    @staticmethod
    def from_object(json):
        assert isinstance(json, dict) or isinstance(json, list)
        return JSON(json)

    def to_str(self):
        return json.dumps(self.data)

    def to_bytes(self, encoding='utf_8'):
        return self.to_str().encode(encoding)

    def to_object(self):
        return self.data
