# Installation Guide

This guide explains how to install Moxel.

## With Python PIP

The easiest way to install Moxel regardless of the operating system is through `pip`. 

```
pip install moxel
```

<center>
<img src="https://www.dropbox.com/s/44wfsgrss6zdei8/Screenshot%202017-09-18%2015.39.58.png?dl=1" width="80%"></img>
</center>

This step will install two things:

* **Moxel CLI**: a command-line tool to deploy machine learning models.
* **Moxel Python Client**: this is a Python client to use Moxel models, through `import moxel`.

After pip install, to test if the CLI is working, run

```
moxel login
```

<center>
<img src="https://www.dropbox.com/s/8744jj17lhxrxuo/Screenshot%202017-09-18%2015.46.17.png?dl=1" width="50%"/>
</center>

If you are using a local computer, this step will open a web browser; if you currently ssh into a remote cluster, `moxel` will ask for username and passwords in headless mode.

You can also checkout the moxel version by 

```
moxel version
```

## Manually Install CLI

Moxel CLI is released as standalone binaries. You can download them through

```
curl -o moxel http://beta.moxel.ai/release/cli/latest/<system>/moxel
```

Here `<system>` is the operating system you are running with: `osx`, `linux` or `windows`.



<br/>