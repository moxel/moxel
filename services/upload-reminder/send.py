from tornado.template import Loader
from mail import send_email, create_campaign
import auth0

loader = Loader('upload-reminder')

def send_reminder(userId, modelName, email):
    ''' Hot Models of the Week. Issue #1
        10/25/2017
    '''
    tutorials = [
        {
            'name': 'Image Colorization in Caffe',
            'description': 'Given a grayscale photograph as input, this model hallucinates a plausible color version of the photograph. In this tutorial, you\'ll learn how to take an open-source model and deploy to Moxel within a few minutes.',
            'link': 'https://github.com/moxel/caffe-colorization'
        },
        {
            'name': 'Question-Answering on SQuAD dataset',
            'description': 'In this tutorial, you\'ll learn how to deploy a question-answering model trained on Stanford QA Dataset (SQuAD). Stanford Question Answering Dataset (SQuAD) is a new reading comprehension dataset, consisting of questions posed by crowdworkers on a set of Wikipedia articles, where the answer to every question is a segment of text, or span, from the corresponding reading passage. ',
            'link': 'http://docs.moxel.ai/tutorials/question-answering'
        },
        {
            'name': 'MNIST digit recognizer with Tensorflow',
            'description': 'This tutorial shows how to wrap a basic MNIST model in Tensorflow and upload it to Moxel. MNIST is one of the most classic datasets of machine learning. We use this simple example to show how to deploy a computer vision model to Moxel.',
            'link': 'http://docs.moxel.ai/tutorials/mnist/'
        },
    ]

    url = 'http://beta.moxel.ai/upload/{}/{}/latest'.format(userId, modelName)
    html = loader.load('index.html').generate(tutorials=tutorials, userId=userId,
                                                        modelName=modelName, url=url)
    html = html.decode('utf-8')
    print(html)

    send_email(email, html, subject='Reminder: Upload Your Awesome AI to Moxel')
    # create_campaign('Hot Models of the Week - Friendly Chatbot, Adversarial Attackers, SqueezeNet, ...', html)


def send_reminder_wave_1():
    data = [
        ('strin', 'foo'),
        ('jimfan', 'AlexNet'),
        ('billsun', 'trend'),
        ('chrislengerich', 'kws'),
        ('danfei', 'vgg-mnist'),
        ('fabeschan', 'test-model'),
        ('joschu', 'test'),
        ('kelvin', 'neural-editor'),
        ('nishith', 'nish-model'),
        ('panwar', 'Chat'),
        ('zayd', 'test-model-1')
    ]

    for userId, modelName in data:
        send_reminder(userId, modelName, email_by_username[userId])

access_token = auth0.get_access_token()
users = auth0.get_all_users(access_token)
email_by_username = {}

for user in users:
    username = user['nickname']
    email = user['email']
    email_by_username[username] = email

# send_reminder('strin', 'inception-v3', email_by_username['strin'])
send_reminder_wave_1()
