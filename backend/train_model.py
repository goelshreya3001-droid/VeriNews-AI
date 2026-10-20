"""Re-creates the notebook pipeline and saves every artefact the API needs.

Run:  python train_model.py
Needs: backend/data/Fake.csv and backend/data/True.csv (Kaggle ISOT dataset)
"""
import json
import sys

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score)
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC

import config


def main():
    for p in (config.FAKE_CSV, config.TRUE_CSV):
        if not p.exists():
            sys.exit(f"Missing dataset file: {p}\nPut Fake.csv and True.csv in backend/data/")

    fake = pd.read_csv(config.FAKE_CSV)
    real = pd.read_csv(config.TRUE_CSV)
    fake["label"] = 0
    real["label"] = 1

    news = pd.concat([fake, real], ignore_index=True)
    news = news.sample(frac=1, random_state=42).reset_index(drop=True)
    news = news.drop_duplicates().reset_index(drop=True)

    news["raw_content"] = news["title"].fillna("") + " " + news["text"].fillna("")
    news["content"] = news["raw_content"].apply(config.clean_text)

    X, y = news["content"], news["label"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print("Train:", X_train.shape, "Test:", X_test.shape)

    tfidf = TfidfVectorizer(max_features=5000, stop_words="english")
    Xtr = tfidf.fit_transform(X_train)
    Xte = tfidf.transform(X_test)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000),
        "Naive Bayes": MultinomialNB(),
        "Linear SVM": LinearSVC(),
    }

    results = []
    for name, clf in models.items():
        clf.fit(Xtr, y_train)
        pred = clf.predict(Xte)
        tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
        row = {
            "model": name,
            "accuracy": float(accuracy_score(y_test, pred)),
            "precision": float(precision_score(y_test, pred)),
            "recall": float(recall_score(y_test, pred)),
            "f1": float(f1_score(y_test, pred)),
            # rows = actual (Fake, Real), cols = predicted (Fake, Real)
            "confusion_matrix": [[int(tn), int(fp)], [int(fn), int(tp)]],
        }
        results.append(row)
        print(f"{name:20s} acc={row['accuracy']:.4f} f1={row['f1']:.4f}")

    # Deployed model = Linear SVM (same choice as the notebook)
    config.MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(models["Linear SVM"], config.MODEL_PATH)
    joblib.dump(tfidf, config.VECTORIZER_PATH)

    metrics = {
        "deployed_model": "Linear SVM",
        "dataset": {
            "rows_after_dedup": int(len(news)),
            "fake": int((news["label"] == 0).sum()),
            "real": int((news["label"] == 1).sum()),
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
            "tfidf_features": 5000,
        },
        "models": results,
    }
    config.METRICS_PATH.write_text(json.dumps(metrics, indent=2))

    # Real held-out test articles (raw text) for the "sample article" buttons
    test_idx = X_test.index
    samples = []
    for label in (0, 1):
        subset = news.loc[test_idx][news.loc[test_idx, "label"] == label].sample(
            n=3, random_state=7
        )
        for _, r in subset.iterrows():
            samples.append({
                "title": str(r["title"]),
                "text": str(r["text"])[:3000],
                "actual_label": int(r["label"]),
            })
    config.SAMPLES_PATH.write_text(json.dumps(samples, indent=2))
    print("Saved model, vectorizer, metrics.json and samples.json to", config.MODEL_DIR)


if __name__ == "__main__":
    main()
