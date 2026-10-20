"""Flask API for the Fake News Detector.

Endpoints
  GET  /api/health   -> {"status","model_loaded"}
  POST /api/predict  -> body {"text": "..."}  -> label + decision score
  GET  /api/metrics  -> metrics.json produced by train_model.py
  GET  /api/samples  -> real held-out test articles
"""
import json

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

import config

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": config.CORS_ORIGINS}})

model = vectorizer = None
load_error = None
try:
    model = joblib.load(config.MODEL_PATH)
    vectorizer = joblib.load(config.VECTORIZER_PATH)
except Exception as exc:  # noqa: BLE001
    load_error = f"{exc}. Run 'python train_model.py' first."
    print("WARNING:", load_error)


def _read_json(path):
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


@app.get("/api/health")
def health():
    return jsonify(status="ok", model_loaded=model is not None, error=load_error)


@app.post("/api/predict")
def predict():
    if model is None:
        return jsonify(error=load_error), 503
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()
    if len(text.split()) < 10:
        return jsonify(error="Please enter at least 10 words of news text."), 400

    cleaned = config.clean_text(text)
    features = vectorizer.transform([cleaned])
    pred = int(model.predict(features)[0])
    score = float(model.decision_function(features)[0])  # >0 => Real, <0 => Fake
    return jsonify(
        prediction=pred,
        label=config.LABELS[pred],
        decision_score=round(score, 4),
        model="Linear SVM",
        word_count=len(text.split()),
    )


@app.get("/api/metrics")
def metrics():
    data = _read_json(config.METRICS_PATH)
    if data is None:
        return jsonify(error="metrics.json not found. Run train_model.py."), 404
    return jsonify(data)


@app.get("/api/samples")
def samples():
    data = _read_json(config.SAMPLES_PATH)
    if data is None:
        return jsonify(error="samples.json not found. Run train_model.py."), 404
    return jsonify(data)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
