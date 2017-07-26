from flask import Flask, request, redirect
import analytics
from datetime import datetime

analytics.write_key = "Mezspk1rncQoF44Wxi2hy6rmsdDPWfEB"

BUCKET = 'dummy-release'

app = Flask(__name__)


@app.route('/<path:path>', methods=['GET'])
def index(path):
    user = request.args.get('user', 'unknown')
    analytics.track(user, 'Download CLI', {
        'datetime': datetime.now().isoformat()
    })
    return redirect('https://storage.googleapis.com/dummy-release/{}'.format(path))


if __name__ == '__main__':
    app.run(debug=False, port=8080, host='0.0.0.0')

