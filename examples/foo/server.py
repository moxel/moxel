from flask import Flask, jsonify, request
import random

app = Flask(__name__)

with open('asset', 'r') as f:
    print('asset', f.read())

@app.route('/', methods=['GET'])
def healthcheck():
	return 'OK'

@app.route('/', methods=['POST'])
def predict():
	data = request.json
	seed = data['seed']
	random.seed(int(seed))
	return jsonify({
		'number': str(random.random())
	})

app.run(port=5900, host='0.0.0.0')
