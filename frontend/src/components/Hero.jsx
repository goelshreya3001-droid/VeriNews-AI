export default function Hero({ metrics }) {
  const best = metrics?.models?.find((m) => m.model === metrics.deployed_model);
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <p className="eyebrow">NLP · Text Classification</p>
        <h1>Detect fake news with <span className="grad">machine learning</span></h1>
        <p className="lead">
          Paste a news article and a TF-IDF + Linear SVM model trained on {metrics ? metrics.dataset.rows_after_dedup.toLocaleString() : "tens of thousands of"} labelled
          articles will classify it as Fake or Real.
        </p>
        <div className="hero-actions">
          <a className="btn primary" href="#analyzer">Analyze an article</a>
          <a className="btn ghost" href="#metrics">View model metrics</a>
        </div>
        {best && (
          <dl className="hero-stats">
            <div><dt>Test accuracy</dt><dd>{(best.accuracy * 100).toFixed(2)}%</dd></div>
            <div><dt>F1 score</dt><dd>{(best.f1 * 100).toFixed(2)}%</dd></div>
            <div><dt>Test articles</dt><dd>{metrics.dataset.test_size.toLocaleString()}</dd></div>
          </dl>
        )}
      </div>
    </section>
  );
}
