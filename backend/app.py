import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import PyMongoError

app = Flask(__name__)
CORS(app)

load_dotenv()

VALID_WORKSPACES = {"Study", "Project"}


def init_mongodb():
    mongodb_uri = os.getenv("MONGODB_URI")
    database_name = os.getenv("MONGODB_DB_NAME", "shiftdesk")

    if not mongodb_uri:
        return None, "not_configured"

    try:
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=2000)
        client.admin.command("ping")
        return client[database_name], "available"
    except PyMongoError:
        return None, "unavailable"


mongodb, mongodb_status = init_mongodb()


def goals_collection():
    if mongodb is None:
        return None
    return mongodb["goals"]


def serialize_goal(document):
    item = {
        "id": str(document["_id"]),
        "goal": document["goal"],
        "workspace": document["workspace"],
        "created_at": document["created_at"].isoformat(),
    }

    if "subject" in document:
        item["subject"] = document["subject"]
    if "project" in document:
        item["project"] = document["project"]

    return item


def mongodb_error_response():
    if mongodb_status == "not_configured":
        return (
            jsonify({"error": "MongoDB is not configured. Set MONGODB_URI."}),
            503,
        )

    return jsonify({"error": "MongoDB is unavailable."}), 503


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
        "status": "healthy",
        "database": {"status": mongodb_status},
    })


@app.route("/api/goals", methods=["POST"])
def create_goal():
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON."}), 400

    payload = request.get_json(silent=True)
    if payload is None or not isinstance(payload, dict):
        return jsonify({"error": "Invalid JSON payload."}), 400

    goal = payload.get("goal")
    workspace = payload.get("workspace")

    if not isinstance(goal, str) or not goal.strip():
        return jsonify({"error": "Goal is required and must be non-empty."}), 400

    if workspace not in VALID_WORKSPACES:
        return jsonify({"error": "Workspace must be either Study or Project."}), 400

    collection = goals_collection()
    if collection is None:
        return mongodb_error_response()

    document = {
        "goal": goal.strip(),
        "workspace": workspace,
        "created_at": datetime.now(timezone.utc),
    }

    subject = payload.get("subject")
    if workspace == "Study" and isinstance(subject, str) and subject.strip():
        document["subject"] = subject.strip()

    project = payload.get("project")
    if workspace == "Project" and isinstance(project, str) and project.strip():
        document["project"] = project.strip()

    try:
        result = collection.insert_one(document)
    except PyMongoError:
        return jsonify({"error": "Failed to store goal. MongoDB is unavailable."}), 503

    document["_id"] = result.inserted_id
    return jsonify({"goal": serialize_goal(document)}), 201


@app.route("/api/goals", methods=["GET"])
def list_goals():
    workspace = request.args.get("workspace")
    query = {}
    if workspace:
        if workspace not in VALID_WORKSPACES:
            return (
                jsonify({"error": "Workspace must be either Study or Project."}),
                400,
            )
        query["workspace"] = workspace

    collection = goals_collection()
    if collection is None:
        return mongodb_error_response()

    try:
        items = collection.find(query).sort("created_at", -1)
        goals = [serialize_goal(item) for item in items]
    except PyMongoError:
        return jsonify({"error": "Failed to load goals. MongoDB is unavailable."}), 503

    return jsonify({"goals": goals})


if __name__ == "__main__":
    app.run(debug=True, port=5000)