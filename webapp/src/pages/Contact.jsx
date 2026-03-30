import { useState } from 'react'

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="page-section">
      <header>
        <p className="status-label">Get in touch</p>
        <h2>Need help integrating the gas monitor?</h2>
        <p className="status-label">
          Drop us a note and we will share wiring diagrams, deployment tips, or help you expand the
          dashboard for remote monitoring.
        </p>
      </header>

      <div className="info-grid">
        <div className="info-card">
          <h3>Support hours</h3>
          <p>Mon–Fri · 9:00–17:00 IST</p>
          <p>Email: safety@coalminer.lab</p>
          <p>Phone: +91 98765 43210</p>
        </div>
        <div className="info-card">
          <h3>Community</h3>
          <p>Join our Discord or share your build on GitHub for feedback.</p>
          <ul className="instructions">
            <li>Discord: coalminer.safety/community</li>
            <li>GitHub issues: github.com/coalminer-lab</li>
            <li>Workshops every second Saturday</li>
          </ul>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Share your use case or question…"
          value={form.message}
          onChange={handleChange}
          required
        />

        <button className="cta-button" type="submit">
          Send message
        </button>
      </form>

      {submitted && (
        <div className="success-banner">Thanks! We will reply to your message within 24 hours.</div>
      )}
    </section>
  )
}

export default Contact


