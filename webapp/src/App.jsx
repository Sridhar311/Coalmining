import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">⛏️</div>
          <div>
            <h1>CoalMiner</h1>
            <p>Gas Monitoring Dashboard</p>
          </div>
        </div>

        <nav>
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/employees">Employees</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} CoalMiner Safety Lab. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://www.arduino.cc/" target="_blank" rel="noreferrer">
            Arduino Docs
          </a>
          <a
            href="https://developer.chrome.com/docs/capabilities/web-serial/"
            target="_blank"
            rel="noreferrer"
          >
            Web Serial
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
