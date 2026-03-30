import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EMPLOYEES = [
  {
    id: 'emp-001',
    name: 'Sridhar',
    role: 'Shift Supervisor',
    location: 'Mine Block A',
    status: 'Safe',
    gasLevel: 82,
    lastCheck: '2 min ago',
    badge: '🛡️',
  },
  {
    id: 'emp-002',
    name: 'Hemalatha',
    role: 'Safety Lead',
    location: 'Ventilation Zone',
    status: 'Alert',
    gasLevel: 138,
    lastCheck: 'just now',
    badge: '⚠️',
  },
  {
    id: 'emp-003',
    name: 'Rohith',
    role: 'Gas Technician',
    location: 'Tunnel 3',
    status: 'Safe',
    gasLevel: 95,
    lastCheck: '5 min ago',
    badge: '⛏️',
  },
  {
    id: 'emp-004',
    name: 'Kumar',
    role: 'Maintenance Chief',
    location: 'Control Room',
    status: 'Safe',
    gasLevel: 76,
    lastCheck: '12 min ago',
    badge: '🧰',
  },
]

const Employees = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [zoneFilter, setZoneFilter] = useState('all')

  const zones = useMemo(
    () => ['all', ...new Set(EMPLOYEES.map((employee) => employee.location))],
    [],
  )

  const filteredEmployees = useMemo(() => {
    return EMPLOYEES.filter((employee) => {
      const matchesZone = zoneFilter === 'all' || employee.location === zoneFilter
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        employee.name.toLowerCase().includes(q) ||
        employee.role.toLowerCase().includes(q)
      return matchesZone && matchesQuery
    })
  }, [query, zoneFilter])

  const stats = useMemo(() => {
    const total = EMPLOYEES.length
    const alerts = EMPLOYEES.filter((employee) => employee.status === 'Alert').length
    const zonesCovered = new Set(EMPLOYEES.map((employee) => employee.location)).size
    return { total, alerts, zonesCovered }
  }, [])

  const handleSelect = (employee) => {
    navigate('/', { state: { employee } })
  }

  return (
    <section className="page-section">
      <header>
        <p className="status-label">Crew directory</p>
        <h2>Select an employee to monitor</h2>
        <p className="status-label">
          Choose a crew member to open the real-time gas analytics dashboard for that operator.
        </p>
      </header>

      <div className="employee-stats">
        <div className="stat-card">
          <p className="status-label">Total crew</p>
          <strong>{stats.total}</strong>
          <small>Ready for deployment</small>
        </div>
        <div className="stat-card alert">
          <p className="status-label">Active alerts</p>
          <strong>{stats.alerts}</strong>
          <small>Requires priority review</small>
        </div>
        <div className="stat-card">
          <p className="status-label">Zones covered</p>
          <strong>{stats.zonesCovered}</strong>
          <small>Ventilation checkpoints</small>
        </div>
      </div>

      <div className="employee-actions">
        <input
          type="search"
          placeholder="Search by name or role"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="filter-row">
          {zones.map((zone) => (
            <button
              key={zone}
              type="button"
              className={`filter-chip ${zoneFilter === zone ? 'active' : ''}`}
              onClick={() => setZoneFilter(zone)}
            >
              {zone === 'all' ? 'All zones' : zone}
            </button>
          ))}
        </div>
      </div>

      <div className="employee-list">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <p>No employees matched your search.</p>
            <small>Try a different name, role, or zone.</small>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              className="employee-card"
              onClick={() => handleSelect(employee)}
            >
              <div className="employee-header">
                <span className="employee-badge">{employee.badge}</span>
                <div>
                  <div className="employee-name">{employee.name}</div>
                  <div className="employee-role">{employee.role}</div>
                </div>
              </div>
              <div className="employee-meta">{employee.location}</div>
              <div className="employee-readings">
                <div>
                  <p className="status-label">Gas level</p>
                  <strong>{employee.gasLevel} ppm</strong>
                </div>
                <div>
                  <p className="status-label">Last check</p>
                  <strong>{employee.lastCheck}</strong>
                </div>
                <span
                  className={`status-pill ${
                    employee.status === 'Alert' ? 'alert' : 'safe'
                  }`}
                >
                  {employee.status}
                </span>
              </div>
              <span className="employee-cta">View analytics →</span>
            </button>
          ))
        )}
      </div>
    </section>
  )
}

export default Employees

