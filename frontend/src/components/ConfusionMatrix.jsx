export default function ConfusionMatrix({ matrix, title }) {
  const max = Math.max(...matrix.flat());
  const cells = [
    ["True Fake", matrix[0][0], true],
    ["False Real", matrix[0][1], false],
    ["False Fake", matrix[1][0], false],
    ["True Real", matrix[1][1], true],
  ];
  return (
    <figure className="cm" aria-label={`${title} confusion matrix`}>
      <figcaption>{title} · confusion matrix</figcaption>
      <div className="cm-grid">
        <span className="cm-axis top1">Pred: Fake</span>
        <span className="cm-axis top2">Pred: Real</span>
        <span className="cm-axis side1">Actual: Fake</span>
        <span className="cm-axis side2">Actual: Real</span>
        {cells.map(([name, v, good]) => (
          <div
            key={name}
            className={`cm-cell ${good ? "good" : "bad"}`}
            style={{ "--a": Math.max(0.15, v / max) }}
          >
            <strong>{v.toLocaleString()}</strong>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}
