from tornado.template import Loader
import constants
import requests


MOXEL_USERS_LISTID = 'moxel-users'

def send_email(recipient, html,
               sender='newsletter@moxel.ai',
               sender_name='Moxel Team',
               subject='No Subject', ):
    response = requests.post('https://api.sendgrid.com/v3/mail/send',
                             json={
                                 "personalizations": [
                                    {
                                    "to": [
                                        {
                                        "email": recipient
                                        }
                                    ],
                                    "subject": subject
                                    }
                                ],
                                "from": {
                                    "email": sender,
                                    "name": sender_name
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


def create_list():
    response = requests.post('https://api.sendgrid.com/v3/contactdb/lists',
                             json={
                                 'name': MOXEL_USER_LISTID
                             },
                             headers={
                                 'Authorization': 'Bearer ' + constants.SENDGRID_API_KEY
                             })
    return response.status_code


def add_recipients(emails):
    response = requests.post('https://api.sendgrid.com/v3/contactdb/recipients',
                             json=[
                                 {'email': email} for email in emails
                             ],
                             headers={
                                 'Authorization': 'Bearer ' + constants.SENDGRID_API_KEY
                             })
    print(response.text)
    return response.status_code


def add_recipient_to_list(recipient_id):
    response = requests.post('https://api.sendgrid.com/v3/contactdb/lists',
                             json={
                                 'name': MOXEL_USER_LISTID
                             },
                             headers={
                                 'Authorization': 'Bearer ' + constants.SENDGRID_API_KEY
                             })
    return response.status_code


def create_campaign(title, html):
    response = requests.post('https://api.sendgrid.com/v3/campaigns',
                             json={
                                 'title': title,
                                 'html_content': html
                             },
                             headers={
                                 'Authorization': 'Bearer ' + constants.SENDGRID_API_KEY
                             })
    return response.status_code


if __name__ == '__main__':
    #loader = Loader('templates')

    #models = [
    #    {'name': 'Neural-storyteller'},
    #    {'name': 'Inception-v3'},
    #]
    #html = loader.load('hot-models.html').generate(models=models)
    #html = html.decode('utf-8')
    #print(html)

    #print('Sent', send_email('stl501@gmail.com', html))



    print(add_recipients(['stl501@gmail.com']))
