import {
  CategoryScale,
  Chart,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Line } from 'react-chartjs-2'

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const LED_THRESHOLD = 200
const CHART_HISTORY = 60

const Home = () => {
  const location = useLocation()
  const [selectedEmployee, setSelectedEmployee] = useState(location.state?.employee ?? null)
  const [liveValue, setLiveValue] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState('Idle')
  const [log, setLog] = useState([])
  const [dataPoints, setDataPoints] = useState([])

  const portRef = useRef(null)
  const readerRef = useRef(null)
  const decoderRef = useRef(new TextDecoder())
  const bufferRef = useRef('')

  useEffect(() => {
    if (location.state?.employee) {
      setSelectedEmployee(location.state.employee)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [location])

  const showAnalytics = Boolean(selectedEmployee)

  const appendLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLog((prev) => [{ timestamp, message }, ...prev].slice(0, 60))
  }, [])

  const handleValue = useCallback((value) => {
    setLiveValue(value)
    setUpdatedAt(new Date())
    setStatus(value > LED_THRESHOLD ? 'Toxic gas detected' : 'Safe')
    setDataPoints((prev) => {
      const next = [...prev, value]
      return next.length > CHART_HISTORY ? next.slice(next.length - CHART_HISTORY) : next
    })
  }, [])

  const readLoop = useCallback(async () => {
    if (!portRef.current?.readable) return
    const reader = portRef.current.readable.getReader()
    readerRef.current = reader
    appendLog('Listening for sensor data…')

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          bufferRef.current += decoderRef.current.decode(value, { stream: true })
          const lines = bufferRef.current.split(/\r?\n/)
          bufferRef.current = lines.pop() ?? ''
          lines.forEach((line) => {
            const parsed = parseInt(line.trim(), 10)
            if (!Number.isNaN(parsed)) {
              handleValue(parsed)
            }
          })
        }
      }
    } catch (error) {
      appendLog(`Read error: ${error.message}`)
    } finally {
      reader.releaseLock()
      readerRef.current = null
    }
  }, [appendLog, handleValue])

  const disconnectSerial = useCallback(
    async (silent = false) => {
      setIsConnecting(true)
      try {
        if (readerRef.current) {
          await readerRef.current.cancel()
          readerRef.current.releaseLock()
          readerRef.current = null
        }
      } catch (error) {
        appendLog(`Reader cleanup failed: ${error.message}`)
      }

      try {
        if (portRef.current) {
          await portRef.current.close()
          portRef.current = null
        }
      } catch (error) {
        appendLog(`Port close failed: ${error.message}`)
      }

      if (!silent) {
        appendLog('Serial port closed')
      }

      setIsConnecting(false)
      setIsConnected(false)
    },
    [appendLog],
  )

  const connectSerial = useCallback(async () => {
    if (!showAnalytics) {
      return
    }
    if (!('serial' in navigator)) {
      alert('Web Serial is only available in Chromium-based browsers (Chrome / Edge).')
      return
    }

    setIsConnecting(true)
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 9600 })
      portRef.current = port
      setIsConnected(true)
      appendLog('Serial port opened')
      await readLoop()
    } catch (error) {
      appendLog(`Connection failed: ${error.message}`)
      if (portRef.current) {
        await disconnectSerial(true)
      } else {
        setIsConnecting(false)
      }
    } finally {
      if (!portRef.current) {
        setIsConnecting(false)
      }
    }
  }, [appendLog, disconnectSerial, readLoop, showAnalytics])

  useEffect(() => {
    if (!showAnalytics) return

    const handleDisconnect = () => {
      appendLog('Serial device unplugged')
      disconnectSerial(true)
    }

    navigator.serial?.addEventListener('disconnect', handleDisconnect)
    return () => {
      navigator.serial?.removeEventListener('disconnect', handleDisconnect)
    }
  }, [appendLog, disconnectSerial, showAnalytics])

  useEffect(() => {
    if (!showAnalytics) return
    return () => {
      disconnectSerial(true)
    }
  }, [disconnectSerial, showAnalytics])

  const chartData = useMemo(() => {
    return {
      labels: dataPoints.map((_, idx) => `${idx + 1}`),
      datasets: [
        {
          label: 'Gas reading',
          borderColor: 'rgba(0, 212, 255, 0.9)',
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          data: dataPoints,
          tension: 0.25,
          borderWidth: 3,
          pointRadius: 0,
          fill: true,
        },
      ],
    }
  }, [dataPoints])

  const chartOptions = useMemo(
    () => ({
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { display: false },
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    [],
  )

  const updatedLabel = updatedAt
    ? `Last update: ${updatedAt.toLocaleTimeString()}`
    : 'Last update: waiting…'

  const connectionDetails = isConnected
    ? 'Streaming data…'
    : 'Click connect to begin monitoring'

  const buttonLabel = isConnected ? 'Disconnect Sensor' : 'Connect Sensor'

  const resetDashboard = () => {
    disconnectSerial(true)
    setSelectedEmployee(null)
    setLiveValue(null)
    setUpdatedAt(null)
    setLog([])
    setDataPoints([])
    setStatus('Idle')
  }

  const marketingView = (
    <section className="page-section landing">
      <header>
        <p className="status-label">Website speciality</p>
        <h2>CoalMiner keeps underground crews safe.</h2>
        <p className="status-label">
          We combine classroom-friendly hardware with a premium analytics dashboard so every methane
          spike is visible instantly.
        </p>
      </header>

      <div className="info-grid">
        <div className="info-card">
          <h3>Real-time telemetry</h3>
          <p>Web Serial streaming, alert mirroring, and rolling charts for every crew member.</p>
        </div>
        <div className="info-card">
          <h3>Rapid onboarding</h3>
          <p>Plug in Arduino hardware, open Chrome/Edge, and click connect—no desktop apps needed.</p>
        </div>
        <div className="info-card">
          <h3>Safety-first design</h3>
          <p>Visual + audible alerts, audit logs, and deployment guidance for mine shafts.</p>
        </div>
      </div>

      <div className="landing-cta">
        <Link className="cta-button" to="/employees">
          Browse employees
        </Link>
        <Link className="ghost-button" to="/about">
          Learn the mission
        </Link>
      </div>
    </section>
  )

  if (!showAnalytics) {
    return marketingView
  }

  return (
    <section className="page-section">
      <header>
        <p className="status-label">Live telemetry</p>
        <h2>Monitoring {selectedEmployee?.name}</h2>
        <p className="status-label">
          {selectedEmployee?.role} · {selectedEmployee?.location ?? 'Unknown zone'}
        </p>
      </header>

      <div className="status-grid">
        <div className="status-box">
          <div className="status-label">Live value</div>
          <div className="value">{liveValue ?? '---'}</div>
          <small>{updatedLabel}</small>
        </div>

        <div className="status-box">
          <div className="status-label">Gas status</div>
          <div className={`value ${status === 'Toxic gas detected' ? 'danger' : 'safe'}`}>
            {status}
          </div>
          <small>Alert threshold: {LED_THRESHOLD}</small>
        </div>

        <div className="status-box">
          <div className="status-label">Connection</div>
          <div className="value">{isConnected ? 'Connected' : 'Disconnected'}</div>
          <small>{connectionDetails}</small>
        </div>
      </div>

      <div className="analytics-actions">
        <button
          className="cta-button"
          onClick={isConnected ? () => disconnectSerial() : connectSerial}
          disabled={isConnecting}
        >
          {isConnecting ? 'Please wait…' : buttonLabel}
        </button>
        <button className="ghost-button" type="button" onClick={resetDashboard}>
          Back to overview
        </button>
        <Link className="ghost-button" to="/employees">
          Choose another employee
        </Link>
      </div>

      <div className="chart-panel">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="log">
        {log.length === 0 ? (
          <span>Ready. Press Connect Sensor to begin.</span>
        ) : (
          log.map((entry, idx) => (
            <div key={`${entry.timestamp}-${idx}`}>
              [{entry.timestamp}] {entry.message}
            </div>
          ))
        )}
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>Connect checklist</h3>
          <ul className="instructions">
            <li>Upload the Arduino sketch that prints analog values via Serial.</li>
            <li>Allow Chrome/Edge access to Web Serial when prompted.</li>
            <li>Keep the USB cable connected for power and data.</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Workflow</h3>
          <ul className="instructions">
            <li>Click Connect Sensor and select the COM port for your Arduino.</li>
            <li>Observe the rolling chart for spikes beyond the threshold.</li>
            <li>
              A red alert matches the onboard LED + buzzer when value exceeds {LED_THRESHOLD}.
            </li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Browser support</h3>
          <ul className="instructions">
            <li>Web Serial works in Chromium browsers only.</li>
            <li>Use `chrome://flags/#enable-web-serial` if the feature is disabled.</li>
            <li>For remote dashboards, forward data via Node + WebSocket.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Home


