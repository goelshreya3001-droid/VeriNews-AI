import { useState } from "react";
import { predict } from "../api.js";
import ResultCard from "./ResultCard.jsx";

export default function Analyzer({ samples, disabled }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [actual, setActual] = useState(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function analyze() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      setResult(await predict(text));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function loadSample(s) {
    setText(`${s.title}\n\n${s.text}`);
    setActual(s.actual_label);
    setResult(null);
    setError("");
  }

  return (
    <section className="section" id="analyzer" aria-labelledby="analyzer-h">
      <div className="container">
        <h2 id="analyzer-h">Article analyzer</h2>
        <div className="card">
          <label htmlFor="article" className="label">News article (title + body)</label>
          <textarea
            id="article"
            rows={10}
            value={text}
            placeholder="Paste a news headline and article text here (minimum 10 words)…"
            onChange={(e) => { setText(e.target.value); setActual(null); }}
          />
          <div className="row">
            <span className="count">{words} words</span>
            <div className="row-btns">
              <button className="btn ghost" onClick={() => { setText(""); setResult(null); setError(""); setActual(null); }} disabled={!text || loading}>
                Clear
              </button>
              <button className="btn primary" onClick={analyze} disabled={disabled || loading || words < 10}>
                {loading ? "Analyzing…" : "Analyze article"}
              </button>
            </div>
          </div>

          {samples.length > 0 && (
            <div className="samples">
              <p className="label">Try a real article from the held-out test set</p>
              <div className="chips">
                {samples.map((s, i) => (
                  <button key={i} className="chip" onClick={() => loadSample(s)} title={s.title}>
                    Sample {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="loading" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <div>
                <p>Running TF-IDF vectorization and SVM classification…</p>
                <div className="bar"><span /></div>
              </div>
            </div>
          )}
          {error && <p className="banner" role="alert">{error}</p>}
          {result && <ResultCard result={result} actualLabel={actual} />}
        </div>
      </div>
    </section>
  );
}
