import { useState } from "react"
import { healthService } from "../services/health.service"
import "./Dashboard.scss"

type TTestResult = {
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

export const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TTestResult[]>([])
  const [payload, setPayload] = useState({
    client: "vite-react-ts",
    message: "hello from React + Vite + TS",
  })

  async function handleTestAPI() {
    setLoading(true)
    const timestamp = new Date().toISOString()

    try {
      const data = await healthService.postHealth({
        ...payload,
        timestamp,
      })
      setResults((prev) => [
        {
          success: true,
          data,
          timestamp,
        },
        ...prev,
      ])
    } catch (e: any) {
      const errorMsg = e?.response?.data
        ? JSON.stringify(e.response.data)
        : e?.message || "Unknown error"
      setResults((prev) => [
        {
          success: false,
          error: errorMsg,
          timestamp,
        },
        ...prev,
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleClearResults() {
    setResults([])
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-icon">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div>
              <h1 className="header-title">API Test Dashboard</h1>
              <p className="header-subtitle">
                Base URL: <code>{import.meta.env.VITE_API_BASE_URL || "Not configured"}</code>
              </p>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="control-panel">
            <div className="panel-header">
              <h2 className="panel-title">Request Configuration</h2>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div className="form-group">
              <label className="form-label">Client Name</label>
              <input
                type="text"
                className="form-input"
                value={payload.client}
                onChange={(e) => setPayload({ ...payload, client: e.target.value })}
                placeholder="Enter client name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-textarea"
                value={payload.message}
                onChange={(e) => setPayload({ ...payload, message: e.target.value })}
                placeholder="Enter message"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleTestAPI} disabled={loading}>
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Test POST /health
                  </>
                )}
              </button>

              {results.length > 0 && (
                <button className="btn btn-secondary" onClick={handleClearResults}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear History
                </button>
              )}
            </div>
          </div>

          <div className="results-panel">
            <div className="panel-header">
              <h2 className="panel-title">Test Results</h2>
              <div className="results-count">
                {results.length} {results.length === 1 ? "result" : "results"}
              </div>
            </div>

            {results.length === 0 ? (
              <div className="empty-state">
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="empty-text">No test results yet</p>
                <p className="empty-hint">Click "Test POST /health" to start testing</p>
              </div>
            ) : (
              <div className="results-list">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`result-item ${result.success ? "success" : "error"}`}
                  >
                    <div className="result-header">
                      <div className="result-status">
                        {result.success ? (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        <span className="result-label">{result.success ? "Success" : "Error"}</span>
                      </div>
                      <span className="result-time">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="result-content">
                      {result.success ? JSON.stringify(result.data, null, 2) : result.error}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
