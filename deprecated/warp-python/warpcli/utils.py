import yaml
import sys
import time
import threading
import progressive.bar
import os


def dump_yaml(obj, path):
    with open(path, 'w') as f:
        yaml.dump(obj, f, default_flow_style=False)


def load_yaml(path):
    with open(path, 'r') as f:
        return yaml.load(f)


def mkdir_if_not_exists(path):
    if os.path.exists(path): return
    os.makedirs(path)

def query_yes_no(question, default="yes"):
    valid = {"yes": True, "y": True, "ye": True,
             "no": False, "n": False}
    if default is None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' "
                             "(or 'y' or 'n').\n")

class ProgressBar(object):
    def __init__(self, max_value, title='', unit='GB', **kwargs):
        self.bar = progressive.bar.Bar(max_value=max_value, title=title, **kwargs)
        self.bar.cursor.clear_lines(2)
        self.bar.cursor.save()
        self.unit = unit

    def update(self, val, max_value=None):
        self.bar.cursor.restore()
        if max_value: self.bar.max_value = max_value
        self.bar.draw(val, newline=False)
        sys.stdout.write(' {}\n'.format(self.unit))


class SpinCursor:
    busy = False
    delay = 0.1

    @staticmethod
    def spinning_cursor():
        while 1:
            for cursor in '|/-\\': yield cursor

    def __init__(self, delay=None):
        self.spinner_generator = self.spinning_cursor()
        if delay and float(delay): self.delay = delay

    def spinner_task(self):
        while self.busy:
            sys.stdout.write(next(self.spinner_generator))
            sys.stdout.flush()
            time.sleep(self.delay)
            sys.stdout.write('\b')
            sys.stdout.flush()

    def start(self):
        self.busy = True
        threading.Thread(target=self.spinner_task).start()

    def stop(self):
        self.busy = False
        time.sleep(self.delay)
