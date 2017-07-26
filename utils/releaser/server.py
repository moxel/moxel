from flask import Flask, render_template

BUCKET = 'dummy-release'

app = Flask(__name__)

@app.route('/<path:path>', methods=['GET'])
def index(path):
    return render_template('index.html', path=path)


app.run(debug=False, port=8080, host='0.0.0.0')

