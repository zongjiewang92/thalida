import os
import logging

os.environ["TZ"] = "UTC"
logger = logging.getLogger(__name__)

from flask import Flask, jsonify, request, abort, render_template, send_file, send_from_directory

os.environ["TZ"] = "UTC"
app = Flask(__name__)

BAD_REQUEST = 400
SERVER_ERROR = 500

@app.route('/ping', methods=['GET'])
def ping_pong():
    return jsonify('pong! tsh')

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port="5000")
