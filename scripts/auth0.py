import requests
import constants
from pprint import pprint

def get_access_token():
    response = requests.post('https://' + constants.AUTH0_DOMAIN + '/oauth/token',
                  json={
                      'client_id': constants.AUTH0_CLIENT_ID,
                      'client_secret': constants.AUTH0_CLIENT_SECRET,
                      'audience': 'https://dummyai.auth0.com/api/v2/',
                      'grant_type': 'client_credentials'
                  })
    access_token = response.json().get('access_token')
    assert access_token

    return access_token


def get_all_users(access_token, query=''):
    users = []
    page_id = 0
    num_users_per_page = 100
    total_users = -1

    while True:
        if len(users) > total_users and total_users != -1:
            break

        response = requests.get('https://' + constants.AUTH0_DOMAIN
                + '/api/v2/users?page=%s&per_page=%s&include_totals=true&q=%s' % (
                        page_id, num_users_per_page, query),
                 headers={
                     'Authorization': 'Bearer ' + access_token
                 })

        result = response.json()


        total_users = int(result['total'])

        users.extend(result['users'])

        print('Getting users %d / %d' % (min(len(users), total_users), total_users))

    return users





if __name__ == '__main__':
    access_token = get_access_token()
    print('access_token', access_token)

    all_users = get_all_users(access_token)

    pprint(all_users)
