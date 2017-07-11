# Welcome to Warpdrive


Welcome to the `warpdrive` project!

`warpdrive` is an open-source experiment framework to launch, manage and monitor machine learning experiments in the cloud (AWS, Azure, Google and private clusters).

For any questions, direct to [tianlins@cs.stanford.edu](mailto:tianlins@cs.stanford.edu) or join our slack channel for discussion.

## Motivation

We see tremendous progress in deep learning but the experiment process is far from perfect. Researchers often spend weeks reproducing results in published papers. And there lacks good open-source tools to keep track of messy experiment code / data, to help scientists to iterate faster, and maybe abstract away the complexity of infrastructure.

Currently, the two dominant workflow styles are:

1. `ssh` into cluster machines and run jobs with screen.
2. use some job management system not optimized for machine learning (e.g. borg, k8s)

The first type of workflow is good for fast iteration on small datasets, but difficult to manage lot of experiments or scale up to multiple machines. The second type of workflow sacrifices the convenience of interactive inspection. Both do not provide good support for reproducibility.

## Design

Our design philosophy is very user focused, which implies

1. make infrastructure transparent.
2. provide rich visualization tool to inspect model and results.

As an example, users start with a git repo, such as `pytorch-mnist`. To launch an experiment, they do

    warp run [some cmd, such as python3 train.py]

<center>
<img src="https://www.dropbox.com/s/po3ua1zi2j96ys4/dummy-04-2017.gif?dl=1" width="800px">
</center>

The system automatically creates a snapshot of the git worktree, and mounts the code into a docker container, and ship it through k8s for remote execution. User can use it on any cloud platform. The system also provides micro-service inspection tools, such as tensorboard, jupyter, etc.


