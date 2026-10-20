import { useState } from "react";
import ConfusionMatrix from "./ConfusionMatrix.jsx";

const pct = (v) => (v * 100).toFixed(2) + "%";

export default function Metrics({ metrics }) {
  const [selected, setSelected] = useState(null);
  if (!metrics) {
    return (
      <section className="section" id="metrics">
        <div className="container">
          <h2>Model metrics</h2>
          <p className="muted">Metrics appear here after the backend is running and train_model.py has been executed.</p>
        </div>
      </section>
    );
  }
  const current = selected ?? metrics.deployed_model;
  const m = metrics.models.find((x) => x.model === current);

  return (
    <section className="section alt" id="metrics" aria-labelledby="metrics-h">
      <div className="container">
        <h2 id="metrics-h">Model metrics</h2>
        <p className="muted">
          Evaluated on {metrics.dataset.test_size.toLocaleString()} held-out articles (20% stratified split).
          Deployed model: <strong>{metrics.deployed_model}</strong>.
        </p>

        <div className="grid2">
          <div className="card">
            <div className="table-wrap">
              <table>
                <caption className="sr">Model comparison</caption>
                <thead>
                  <tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1</th></tr>
                </thead>
                <tbody>
                  {metrics.models.map((r) => (
                    <tr key={r.model} className={r.model === current ? "sel" : ""}>
                      <td>
                        <button className="link" onClick={() => setSelected(r.model)} aria-pressed={r.model === current}>
                          {r.model}
                        </button>
                      </td>
                      <td>{pct(r.accuracy)}</td><td>{pct(r.precision)}</td>
                      <td>{pct(r.recall)}</td><td>{pct(r.f1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bars" aria-hidden="true">
              {metrics.models.map((r) => (
                <div key={r.model} className="bar-row">
                  <span>{r.model}</span>
                  <div className="track"><i style={{ width: `${r.accuracy * 100}%` }} /></div>
                  <b>{pct(r.accuracy)}</b>
                </div>
              ))}
            </div>
            <p className="note">Precision, recall and F1 are for the “Real” class (label 1), as in the notebook.</p>
          </div>

          <div className="card">
            <ConfusionMatrix matrix={m.confusion_matrix} title={m.model} />
          </div>
        </div>
      </div>
    </section>
  );
}
