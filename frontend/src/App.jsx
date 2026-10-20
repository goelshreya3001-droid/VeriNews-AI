import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Analyzer from "./components/Analyzer.jsx";
import Metrics from "./components/Metrics.jsx";
import { getHealth, getMetrics, getSamples } from "./api.js";

export default function App() {
  const [online, setOnline] = useState(null); // null = checking
  const [metrics, setMetrics] = useState(null);
  const [samples, setSamples] = useState([]);
  const [setupError, setSetupError] = useState("");

  useEffect(() => {
    getHealth()
      .then((h) => {
        setOnline(h.model_loaded);
        if (!h.model_loaded) setSetupError(h.error || "Model not loaded.");
      })
      .catch((e) => {
        setOnline(false);
        setSetupError(e.message);
      });
    getMetrics().then(setMetrics).catch(() => {});
    getSamples().then(setSamples).catch(() => {});
  }, []);

  return (
    <>
      <a className="skip" href="#analyzer">Skip to analyzer</a>
      <Navbar online={online} />
      <main>
        <Hero metrics={metrics} />
        {setupError && (
          <div className="container">
            <p className="banner" role="alert">{setupError}</p>
          </div>
        )}
        <Analyzer samples={samples} disabled={online === false} />
        <Metrics metrics={metrics} />
      </main>
      <footer className="footer">
        <div className="container">
          Academic NLP project · TF-IDF + Linear SVM · Dataset: Fake and Real News (ISOT)
        </div>
      </footer>
    </>
  );
}
