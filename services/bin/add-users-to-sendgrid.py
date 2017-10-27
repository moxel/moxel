from auth0 import get_access_token, get_all_users
from mail import add_recipients
from pprint import pprint

import csv


access_token = get_access_token()
print('access_token', access_token)

all_users = get_all_users(access_token)

pprint(all_users)

emails = [user['email'] for user in all_users]

# add_recipients(emails)

with open('recipients.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames=['Email'])

    writer.writeheader()

    for user in all_users:
        writer.writerow({
            'Email': user['email']
        })
