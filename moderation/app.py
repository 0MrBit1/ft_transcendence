import os
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "moderation"})


@app.route("/api/moderate", methods=["POST"])
def moderate():
    """
    Receive text content and return a moderation verdict.

    Expected JSON body:
      { "text": "some user-generated content" }

    Returns:
      { "flagged": false, "reason": null }
    """
    data = request.get_json(force=True)
    text = data.get("text", "")

    # TODO: Implement actual moderation logic (profanity filter, AI check, etc.)
    flagged = False
    reason = None

    return jsonify({"flagged": flagged, "reason": reason})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
