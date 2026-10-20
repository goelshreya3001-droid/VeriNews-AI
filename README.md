# VeriNews AI – NLP Fake News Detection (Flask + React)

Pipeline from the notebook: text cleaning → TF-IDF (5000 features, English stop-words) → Logistic Regression / Naive Bayes / **Linear SVM** (deployed).

```
fake-news-detector/
├── backend/
│   ├── app.py              Flask API (CORS enabled for the Vite dev server)
│   ├── config.py           paths, CORS origins, clean_text() (same as notebook)
│   ├── train_model.py      trains all 3 models, saves model + metrics + samples
│   ├── requirements.txt
│   ├── data/               put Fake.csv and True.csv here
│   └── models/             generated: fake_news_model.pkl, tfidf_vectorizer.pkl, metrics.json, samples.json
└── frontend/               Vite + React 18
    ├── package.json, vite.config.js, index.html, .env
    └── src/ main.jsx, App.jsx, api.js, styles.css, components/*
```

## Requirements
Python 3.10–3.12, Node.js 18+ (LTS), and the dataset files `Fake.csv` + `True.csv` (the same ones used in the notebook).

## Windows setup (Command Prompt)

### 1. Backend
```bat
cd fake-news-detector\backend
python -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```
Copy `Fake.csv` and `True.csv` into `backend\data\`, then train (takes about a minute or two):
```bat
python train_model.py
python app.py
```
API runs at http://127.0.0.1:5000 . Check http://127.0.0.1:5000/api/health

*PowerShell:* activate with `venv\Scripts\Activate.ps1`. If blocked, run once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 2. Frontend (new terminal)
```bat
cd fake-news-detector\frontend
npm install
npm run dev
```
Open http://localhost:5173

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | status + whether model is loaded |
| POST | `/api/predict` | `{"text": "..."}` → `{prediction, label, decision_score, model, word_count}` (min 10 words) |
| GET | `/api/metrics` | model comparison + confusion matrices (computed by `train_model.py`) |
| GET | `/api/samples` | 6 real held-out test articles for the sample buttons |

## Consistency checks
- Frontend `VITE_API_URL` (`frontend/.env`) = `http://127.0.0.1:5000` = backend host/port in `app.py`.
- Backend CORS allows `http://localhost:5173` and `http://127.0.0.1:5173` (override with env var `CORS_ORIGINS`, comma-separated).
- Model paths are resolved relative to `backend/` via `config.py`, so you can start `app.py` from any folder.
- Label encoding: 0 = Fake, 1 = Real (same as notebook).

## Results from your notebook (20% test split, 8,938 articles)
| Model | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| Logistic Regression | 98.94% | 98.55% | 99.22% | 98.88% |
| Naive Bayes | 93.72% | 93.73% | 93.00% | 93.36% |
| **Linear SVM** | **99.51%** | 99.53% | 99.43% | 99.48% |

Linear SVM confusion matrix (rows = actual Fake/Real): `[[4676, 20], [24, 4218]]`.
`train_model.py` recomputes these; the dashboard shows whatever it saved to `metrics.json`.

## Limitations (be upfront in your viva)
- The ISOT dataset is from limited sources and years; real articles often contain agency tags like "(Reuters)", so very high scores may partly reflect source style, not truthfulness.
- The model classifies writing patterns, it does not fact-check claims. Performance on other outlets/topics is untested.
- The SVM output is a margin, not a calibrated probability.

## Troubleshooting
- `Missing dataset file` → put the CSVs in `backend\data\`.
- Red "API offline" badge → backend not running, or run `python train_model.py` first.
- Port 5173/5000 busy → close the other app (Vite is set to `strictPort` so CORS stays valid).
- Pickle version warnings → use the same `requirements.txt` versions you trained with.
