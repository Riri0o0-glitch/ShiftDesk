from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "ShiftDesk backend is running!",
        "status": "success"
    })


@app.route("/api/health")
def health():
    return jsonify({
        "app": "ShiftDesk",
        "backend": "Flask",
        "status": "healthy"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)