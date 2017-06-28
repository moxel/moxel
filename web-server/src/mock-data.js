export const store = {
    account: {
        username: "episodeyang",
        name: "Ge Yang",
        profileImage: "/images/episodeyang.jpg"
    },
    models: {
        featured: [],
        trending: {
            thisWeek: []
        },
        newest: [],
        recentlyUpdated: [],
        stats: {
            total: 8000,
            totalDownload: 9900000000
        },
        searchResult: [
            {
                id: "DeepScale/SqueezeNet",
                title: "squeezeNet",
                details: "SqueezeNet: AlexNet-level accuracy with 50x fewer parameters",
                readme: "# SqueezeNet: AlexNet-level Accuracy with 50x fewer parameters\nThe Caffe-compatible files that you are probably looking for:\n\n```\nSqueezeNet_v1.0/train_val.prototxt          #model architecture\nSqueezeNet_v1.0/solver.prototxt             #additional training details (learning rate schedule, etc.)\nSqueezeNet_v1.0/squeezenet_v1.0.caffemodel  #pretrained model parameters\n```\n\nnIf you find SqueezeNet useful in your research, please consider citing the [SqueezeNet paper](http://arxiv.org/abs/1602.07360):\n\n```\n@article{SqueezeNet,\nAuthor = {Forrest N. Iandola and Song Han and Matthew W. Moskewicz and Khalid Ashraf and William J. Dally and Kurt Keutzer},\nTitle = {SqueezeNet: AlexNet-level accuracy with 50x fewer parameters and $<$0.5MB model size},\nJournal = {arXiv:1602.07360},\nYear = {2016}\n}\n```\n\nHelpful hints:\n\n1. **Getting the SqueezeNet model:** `git clone <this repo>`.\nIn this repository, we include Caffe-compatible files for the model architecture, the solver configuration, and the pretrained model (4.8MB uncompressed).\n\n2. **Batch size.** We have experimented with batch sizes ranging from 32 to 1024. In this repo, our default batch size is 512. If implemented naively on a single GPU, a batch size this large may result in running out of memory. An effective workaround is to use hierarchical batching (sometimes called \"delayed batching\"). Caffe supports hierarchical batching by doing `train_val.prototxt>batch_size` training samples concurrently in memory. After `solver.prototxt>iter_size` iterations, the gradients are summed and the model is updated. Mathematically, the batch size is `batch_size * iter_size`. In the included prototxt files, we have set `(batch_size=32, iter_size=16)`, but any combination of batch_size and iter_size that multiply to 512 will produce eqivalent results. In fact, with the same random number generator seed, the model will be fully reproducable if trained multiple times. Finally, note that in Caffe `iter_size` is applied while training on the training set but not while testing on  the test set.\n\n3. **Implementing Fire modules.** In the paper, we describe the `expand` portion of the Fire layer as a collection of 1x1 and 3x3 filters. Caffe does not natively support a convolution layer that has multiple filter sizes. To work around this, we implement `expand1x1` and `expand3x3` layers and concatenate the results together in the channel dimension.\n\n4. **The SqueezeNet team has released a few variants of SqueezeNet**. Each of these include pretrained models, and the non-compressed versions include training protocols, too.\n\n    SqueezeNet v1.0 (in this repo), the base model described in our SqueezeNet paper.\n\n    [Compressed SqueezeNet v1.0](https://github.com/songhan/SqueezeNet_compressed), as described in the SqueezeNet paper.\n\n    [SqueezeNet v1.0 with Residual Connections](https://github.com/songhan/SqueezeNet-Residual), which delivers higher accuracy without increasing the model size.\n\n    [SqueezeNet v1.0 with Dense→Sparse→Dense (DSD) Training](https://github.com/songhan/SqueezeNet-DSD-Training), which delivers higher accuracy without increasing the model size.\n\n    SqueezeNet v1.1 (in this repo), which requires 2.4x less computation than SqueezeNet v1.0 without diminshing accuracy.\n\n5. **Community adoption of SqueezeNet**:\n\n    [SqueezeNet in the *MXNet* framework](https://github.com/haria/SqueezeNet), by Guo Haria\n\n    [SqueezeNet in the *Chainer* framework](https://github.com/ejlb/squeezenet-chainer), by Eddie Bell\n\n    [SqueezeNet in the *Keras* framework](https://github.com/DT42/squeezenet_demo), by [dt42.io](https://dt42.io/)\n\n     [SqueezeNet in the *PyTorch* framework](https://github.com/pytorch/vision/blob/master/torchvision/models/squeezenet.py), by Marat Dukhan    \n\n    [Neural Art using SqueezeNet](https://github.com/pavelgonchar/neural-art-mini), by Pavel Gonchar\n\n    [SqueezeNet compression in Ristretto](https://arxiv.org/abs/1605.06402), by Philipp Gysel\n\n\n",
                tags: ["deep learning"],
                contributors: [
                    {username: "forresti", name: "Forrest Landola"},
                    {username: "terrychenism", name: "Terry Chen"}
                ],
                stats: {
                    download: 271,
                    stars: 805
                },
                lastUpdated: '21 days ago',
            },
            {
                id: "episodeyang/resNet",
                title: "resNet",
                details: "resNet: AlexNet-level accuracy with 50x fewer parameters",
                tags: ["deep learning"],
                contributors: [
                    {username: "forresti", name: "Forrest Landola"},
                    {username: "terrychenism", name: "Terry Chen"}
                ],
                stats: {
                    download: 271,
                    stars: 805
                },
                lastUpdated: '21 days ago',
            },
            {
                id: "strin/Wasserstein_GAN",
                title: "Wasserstein GAN",
                details: "SqueezeNet: AlexNet-level accuracy with 50x fewer parameters",
                tags: ["deep learning"],
                contributors: [
                    {username: "forresti", name: "Forrest Landola"},
                    {username: "terrychenism", name: "Terry Chen"}
                ],
                stats: {
                    download: 271,
                    stars: 805
                },
                lastUpdated: '21 days ago',
            },
            {
                id: "zwang/Dueling_networks",
                title: "Dueling Networks",
                details: "Dualing Networks: RL model with separate value function and advantage function",
                tags: ["deep learning"],
                contributors: [
                    {username: "forresti", name: "Forrest Landola"},
                    {username: "terrychenism", name: "Terry Chen"}
                ],
                stats: {
                    download: 271,
                    stars: 805
                },
                lastUpdated: '21 days ago',
            }
        ]

    },
};

