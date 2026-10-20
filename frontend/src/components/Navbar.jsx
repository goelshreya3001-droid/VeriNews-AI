export default function Navbar({ online }) {
  const status =
    online === null ? "Checking API…" : online ? "API online" : "API offline";
  const cls = online === null ? "dot" : online ? "dot on" : "dot off";
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#top" className="brand" aria-label="VeriNews AI home">
          <span className="logo" aria-hidden="true">V</span> VeriNews <span className="brand-ai">AI</span>
        </a>
        <nav aria-label="Primary" className="nav-links">
          <a href="#analyzer">Analyzer</a>
          <a href="#metrics">Model metrics</a>
          <span className="status" role="status"><span className={cls} aria-hidden="true" />{status}</span>
        </nav>
      </div>
    </header>
  );
}
