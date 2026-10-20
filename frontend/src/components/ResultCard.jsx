export default function ResultCard({ result, actualLabel }) {
  const real = result.prediction === 1;
  const margin = Math.abs(result.decision_score);
  const strength = margin > 1 ? "Strong" : margin > 0.4 ? "Moderate" : "Weak";
  return (
    <div className={`result ${real ? "real" : "fake"}`} role="status" aria-live="polite">
      <div className="result-icon" aria-hidden="true">{real ? "✓" : "!"}</div>
      <div>
        <p className="result-kicker">Prediction · {result.model}</p>
        <h3>{result.label}</h3>
        <p className="result-meta">
          Decision score <strong>{result.decision_score}</strong> ({strength} margin from the decision boundary) ·{" "}
          {result.word_count} words analysed
        </p>
        {actualLabel !== undefined && actualLabel !== null && (
          <p className="result-meta">
            Dataset label for this sample: <strong>{actualLabel === 1 ? "Real News" : "Fake News"}</strong>{" "}
            {actualLabel === result.prediction ? "(match)" : "(mismatch)"}
          </p>
        )}
        <p className="note">
          The score is the SVM margin, not a probability. A model trained on one dataset may not generalise to other news sources.
        </p>
      </div>
    </div>
  );
}
