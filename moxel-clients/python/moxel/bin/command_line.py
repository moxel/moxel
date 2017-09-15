import os
import sys
import moxel
try:
    from shlex import quote as cmd_quote
except ImportError:
    from pipes import quote as cmd_quote

def get_script_path():
    return os.path.dirname(os.path.realpath(sys.argv[0]))

_p = sys.platform
if _p.startswith('linux'):
    bin_path = 'linux'
elif _p == 'darwin':
    bin_path = 'osx'
elif _p == 'win32':
    bin_path = 'windows'

moxel_install_dir = os.path.dirname(os.path.abspath(moxel.__file__))
bin_path = os.path.join(moxel_install_dir, 'bin', bin_path, 'moxel') 

def main():
    # print('current', get_script_path())
    cmd = ('{} ' * (len(sys.argv))).format(bin_path, *[cmd_quote(arg) for arg in sys.argv[1:]])
    os.system(cmd)


if __name__ == '__main__':
    main()
