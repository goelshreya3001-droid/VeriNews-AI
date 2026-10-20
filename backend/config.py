"""Shared configuration: paths, CORS origins and the text-cleaning function.

The clean_text() function is IDENTICAL to the one in the notebook so that
training and inference preprocess text the same way.
"""
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"

FAKE_CSV = DATA_DIR / "Fake.csv"
TRUE_CSV = DATA_DIR / "True.csv"

MODEL_PATH = MODEL_DIR / "fake_news_model.pkl"      # LinearSVC (best model)
VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"
METRICS_PATH = MODEL_DIR / "metrics.json"
SAMPLES_PATH = MODEL_DIR / "samples.json"

# Vite dev server runs on 5173 (localhost and 127.0.0.1 are different origins)
CORS_ORIGINS = os.environ.get(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

LABELS = {0: "Fake News", 1: "Real News"}  # same encoding as notebook


def clean_text(text: str) -> str:
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
