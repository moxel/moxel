from tornado.template import Loader
from mail import send_email, create_campaign

loader = Loader('news-hot-models')

def send_issue_1():
    ''' Hot Models of the Week. Issue #1
        10/25/2017
    '''
    models = [
        {
            'name': 'SqueezeNet in Pytorch',
            'repo': 'jimfan/squeezenet/latest',
            'description': 'SqueezeNet: AlexNet-level accuracy with 50x fewer parameters and <0.5MB model size',
            'page-views': 93,
            'demo-runs': 96,
            'stars': 28
        },
        {
            'name': 'Generating Compositional Color Descriptions',
            'repo': 'futurulus/color-describer/latest',
            'description': 'This is the model from the paper Learning to Generate Compositional Color Descriptions (Monroe, Goodman & Potts, 2016). It takes a color as input and produces a description based on data from the xkcd Color Survey assembled by McMahan & Stone (2015). Try running it more than once with the same color!',
            'page-views': 161,
            'demo-runs': 398,
            'stars': 3
        },
        {
            'name': 'A Friendly Chatbot',
            'repo': 'awni/chatbot-v0/latest',
            'description': 'A neural sequence to sequence chatbot trained on the Cornell Movie Dialogue Corpus',
            'page-views': 24,
            'demo-runs': 30,
            'stars': 4
        },
        {
            'name': 'Adversarial attacker to ImageNet classifiers',
            'repo': 'zhangyuc/attacker/latest',
            'description': 'An ensemble attacker to fool Inception V3 ImageNet classifiers. Try generate adversarial examples here, and send it to Inception V3 at: beta.moxel.ai/models/strin/inception-v3',
            'page-views': 46,
            'demo-runs': 44,
            'stars': 2
        },
        {
            'name': 'Neural Networks Tell Romantic Stories From Images',
            'repo': 'strin/neural-storyteller-gpu/latest',
            'description': 'neural-storyteller is a recurrent neural network that tells romantic stories based on images. It uses a VGG network to encode image and generate captions from COCO dataset. Then it aligns the COCO captions with a romantic corpus. Finally, it outputs a sentence using a decoder trained on the romantic corpus. Try uploading different images and see what happens!',
            'page-views': 554,
            'demo-runs': 493,
            'stars': 26
        },
    ]
    html = loader.load('hot-models.html').generate(models=models)
    html = html.decode('utf-8')
    print(html)

    # send_email('stl501@gmail.com', html, subject='Hot Models of the Week - Friendly Chatbot, Adversarial Attackers, SqueezeNet, ...')
    # create_campaign('Hot Models of the Week - Friendly Chatbot, Adversarial Attackers, SqueezeNet, ...', html)




send_issue_1()
