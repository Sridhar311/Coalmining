const About = () => {
  return (
    <section className="page-section">
      <header>
        <p className="status-label">Our mission</p>
        <h2>Why we built CoalMiner</h2>
        <p className="status-label">
          Rapid gas detection saves lives. This project turns low-cost components into a safety
          companion for students, labs, and field crews.
        </p>
      </header>

      <div className="info-grid">
        <article className="info-card">
          <h3>Edge hardware</h3>
          <p>
            An Arduino-compatible MQ sensor samples air quality and converts analog ppm readings into
            discrete alerts. The buzzer and LED provide immediate feedback underground.
          </p>
        </article>

        <article className="info-card">
          <h3>Modern UI</h3>
          <p>
            The React dashboard streams real-time data using the Web Serial API, adds historical
            charts, and logs every event for post-mortem analysis.
          </p>
        </article>

        <article className="info-card">
          <h3>Scalable future</h3>
          <p>
            Modular components make it easy to forward sensor data to edge gateways, IoT clouds, or
            SMS alerting when you are ready to deploy at scale.
          </p>
        </article>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <h3>Tech stack</h3>
          <ul className="instructions">
            <li>Arduino UNO + MQ gas sensor over analog pin A1.</li>
            <li>Real-time stream through USB + Web Serial at 9600 baud.</li>
            <li>React + Vite + Chart.js for the responsive dashboard.</li>
          </ul>
        </article>

        <article className="info-card">
          <h3>Safety philosophy</h3>
          <ul className="instructions">
            <li>Always log raw readings for auditing and calibration.</li>
            <li>Pair visual dashboards with audible alarms underground.</li>
            <li>Combine Web Serial with cloud sync for redundancy.</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default About


