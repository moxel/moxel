from auth0 import get_access_token, get_all_users


access_token = get_access_token()
print('access_token', access_token)

all_users = get_all_users(access_token)

pprint(all_users)


