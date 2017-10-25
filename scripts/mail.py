from tornado.template import Loader
import constants
import requests

def send_email(recipient, html, sender='newsletter@moxel.ai'):
    response = requests.post('https://api.sendgrid.com/v3/mail/send',
                             json={
                                 "personalizations": [
                                    {
                                    "to": [
                                        {
                                        "email": recipient
                                        }
                                    ],
                                    "subject": "Hello, World!"
                                    }
                                ],
                                "from": {
                                    "email": sender
                                },
                                "content": [
                                    {
                                    "type": "text/html",
                                    "value": html
                                    }
                                ]
                             },
                             headers={
                                 'Authorization': 'Bearer ' + constants.SENDGRID_API_KEY
                             })
    return response.status_code


if __name__ == '__main__':
    loader = Loader('templates')

    models = [
        {'name': 'Neural-storyteller'},
        {'name': 'Inception-v3'},
    ]
    html = loader.load('hot-models.html').generate(models=models)
    html = html.decode('utf-8')
    print(html)

    print('Sent', send_email('stl501@gmail.com', html))



