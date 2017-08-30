from .core import Space


def String(max_char=100):
    class StringClass(Space):
        NAME='String'

        def __init__(self, text):
            if len(text) > max_char:
                raise Exception('String exceeds length limit {}'.format(max_char))

            self.text = text

        @staticmethod
        def from_str(text):
            return StringClass(text)

        def to_str(self):
            return self.text

        def to_bytes(self, encoding='utf_8'):
            return self.text.encode(encoding)

    return StringClass
