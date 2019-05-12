def load_constant(key):
    try:
        with open('/etc/credentials/' + key, 'r') as f:
            value = f.read()
        return value
    except:
        raise Exception('Credentials missing: ' + key)

AUTH0_DOMAIN = load_constant('AUTH0_DOMAIN')
AUTH0_CLIENT_ID = load_constant('AUTH0_CLIENT_ID')
AUTH0_CLIENT_SECRET = load_constant('AUTH0_CLIENT_SECRET')
SENDGRID_API_KEY = load_constant('SENDGRID_API_KEY')

