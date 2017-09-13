from .core import Space


class String(Space):
    NAME='String'

    def __init__(self, text):
        self.text = text

    @staticmethod
    def from_str(text):
        return String(text)

    def to_str(self):
        return self.text

    def to_bytes(self, encoding='utf_8'):
        return self.text.encode(encoding)

    def __str__(self):
        return self.text

    def __repr__(self):
        return self.text

