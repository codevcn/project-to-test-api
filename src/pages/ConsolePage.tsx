import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { apiService, TSupportedHttpMethod } from "../services/api.service"
import "./ConsolePage.scss"

type TTestResult = {
  success: boolean
  data?: any
  error?: string
  timestamp: string
  method: TSupportedHttpMethod
  url: string
}

type TJsonField = {
  id: string
  key: string
  value: string
}

const ConsolePage = () => {
  const ownerName = import.meta.env.VITE_OWNER_NAME || "Unknown Owner"
  const defaultDomain = import.meta.env.VITE_API_DEFAULT_URL || "http://localhost:3000"

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TTestResult[]>([])
  const [serverDomain, setServerDomain] = useState(defaultDomain)
  const [apiUrl, setApiUrl] = useState("/health")
  const [httpMethod, setHttpMethod] = useState<TSupportedHttpMethod>("POST")
  const [jsonFields, setJsonFields] = useState<TJsonField[]>([
    { id: crypto.randomUUID(), key: "owner_name", value: ownerName },
  ])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let intervalId: number | null = null

    if (loading) {
      setElapsedSeconds(0)
      intervalId = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [loading])

  function handleAddField() {
    setJsonFields((prev) => [...prev, { id: crypto.randomUUID(), key: "", value: "" }])
  }

  function handleRemoveField(id: string) {
    setJsonFields((prev) => prev.filter((field) => field.id !== id))
  }

  function handleFieldChange(id: string, type: "key" | "value", newValue: string) {
    setJsonFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, [type]: newValue } : field)),
    )
  }

  async function handleTestAPI() {
    const controller = new AbortController()
    setAbortController(controller)
    setLoading(true)
    const timestamp = new Date().toISOString()

    let fullUrl = ""
    try {
      const requestBody =
        httpMethod === "GET"
          ? undefined
          : jsonFields.reduce(
              (acc, field) => {
                if (field.key.trim()) {
                  acc[field.key] = field.value
                }
                return acc
              },
              {} as Record<string, any>,
            )

      fullUrl = serverDomain + apiUrl

      const response = await apiService.sendRequest({
        url: fullUrl,
        method: httpMethod,
        data: requestBody,
        signal: controller.signal,
      })

      setResults((prev) => [
        {
          success: true,
          data: response.data,
          timestamp,
          method: httpMethod,
          url: fullUrl,
        },
        ...prev,
      ])
    } catch (e: any) {
      if (e.name === "CanceledError" || e.code === "ERR_CANCELED") {
        setResults((prev) => [
          {
            success: false,
            error: "Request canceled by user",
            timestamp,
            method: httpMethod,
            url: fullUrl,
          },
          ...prev,
        ])
      } else {
        const errorMsg = e?.response?.data
          ? JSON.stringify(e.response.data)
          : e?.message || "Unknown error"
        setResults((prev) => [
          {
            success: false,
            error: errorMsg,
            timestamp,
            method: httpMethod,
            url: fullUrl,
          },
          ...prev,
        ])
      }
    } finally {
      setLoading(false)
      setAbortController(null)
    }
  }

  function handleCancelRequest() {
    if (abortController) {
      abortController.abort()
    }
  }

  function handleClearResults() {
    setResults([])
  }

  useEffect(() => {
    // scroll to bottom when jsonFields change and focus the last field key input
    const lastItem = rootRef.current?.querySelector<HTMLElement>(
      ".json-fields-list .json-field-item:last-child",
    )
    if (lastItem) {
      lastItem.scrollIntoView({ behavior: "smooth", block: "center" })
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const fieldKey = lastItem.querySelector<HTMLInputElement>(".field-key")
          if (fieldKey) {
            fieldKey.focus()
          }
        })
      })
    }
  }, [jsonFields.length])

  return (
    <div ref={rootRef} className="console">
      <div className="console-container">
        <header className="console-header">
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
                Default Domain: <code>{defaultDomain}</code>
              </p>
            </div>
          </div>
          <Link to="/showcase" className="showcase-link">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
            Game
          </Link>
        </header>

        <div className="console-content">
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
              <label className="form-label">HTTP Method</label>
              <select
                className="form-select"
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value as TSupportedHttpMethod)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Server Domain</label>
              <input
                type="text"
                className="form-input"
                value={serverDomain}
                onChange={(e) => setServerDomain(e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Endpoint</label>
              <input
                type="text"
                className="form-input"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="/api/endpoint"
              />
            </div>

            {httpMethod !== "GET" && (
              <div className="form-group json-fields-group">
                <div className="json-fields-header">
                  <label className="form-label">Request Body (JSON)</label>
                  <button className="btn-add-field" onClick={handleAddField}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Field
                  </button>
                </div>

                <div className="json-fields-list">
                  {jsonFields.map((field) => (
                    <div key={field.id} className="json-field-item">
                      <input
                        type="text"
                        className="field-input field-key"
                        value={field.key}
                        onChange={(e) => handleFieldChange(field.id, "key", e.target.value)}
                        placeholder="Key"
                      />
                      <input
                        type="text"
                        className="field-input field-value"
                        value={field.value}
                        onChange={(e) => handleFieldChange(field.id, "value", e.target.value)}
                        placeholder="Value"
                      />
                      <button
                        className="btn-remove-field"
                        onClick={() => handleRemoveField(field.id)}
                        disabled={jsonFields.length === 1}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <p className="empty-hint">Click "Bắt đầu test" to start testing</p>
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
                        <span className="result-label">
                          <span>{result.success ? "Success" : "Error"}</span>
                          <span> #{results.length - index}</span>
                        </span>
                      </div>
                      <div className="result-meta">
                        <span className="result-method">{result.method}</span>
                        <span className="result-url">{result.url}</span>
                        <span className="result-time">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
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

        <div className="floating-actions">
          <div className="floating-actions-container">
            <button className="btn btn-start-testing" onClick={handleTestAPI} disabled={loading}>
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
                  Testing... ({elapsedSeconds}s)
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
                  Bắt đầu test
                </>
              )}
            </button>

            {loading && (
              <button className="btn btn-danger" onClick={handleCancelRequest}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Hủy
              </button>
            )}

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

        <footer className="console-footer">
          <div className="footer-content">
            <div className="footer-section">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <span>API Test Dashboard</span>
            </div>
            <div className="footer-section">
              <span className="footer-text">Built with React & TypeScript</span>
            </div>
            <div className="footer-section">
              <a
                href={import.meta.env.VITE_GITHUB_REPO_URL || "https://github.com"}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
              <a
                href="https://vitejs.dev"
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Vite
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} {ownerName}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ConsolePage
