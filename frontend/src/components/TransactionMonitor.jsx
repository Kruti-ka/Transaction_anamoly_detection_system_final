"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { ScrollArea } from "./ui/scroll-area"
import { AlertTriangle, Play, Pause, Activity, TrendingUp, Clock, Shield } from "lucide-react"
import { formatCurrency, formatDate } from "../utils/utils"

const TransactionMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    let ws
    if (isMonitoring) {
      // Use the correct WebSocket endpoint from the backend
      ws = new WebSocket("ws://localhost:8000/ws/realtime")

      ws.onopen = () => {
        console.log("WebSocket connected to real-time monitoring")
        // Send initial request for data
        ws.send(JSON.stringify({ action: "subscribe" }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("WebSocket message received:", data)

          if (data.latest_transaction) {
            setTransactions((prev) => [data.latest_transaction, ...prev.slice(0, 40)])
          }
          if (data.new_alert) {
            setAlerts((prev) => [data.new_alert, ...prev.slice(0, 9)])
          }
          if (data.transactions) {
            setTransactions(data.transactions.slice(0, 40))
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      ws.onerror = (err) => {
        console.error("WebSocket error:", err)
        setIsMonitoring(false)
      }

      ws.onclose = () => {
        console.log("WebSocket closed")
        setIsMonitoring(false)
      }
    }

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [isMonitoring])

  // Calculate stats from local state with fallbacks
  const stats = {
    active_transactions: transactions.length,
    anomalies_detected: transactions.filter((t) => t.is_anomaly).length,
    total_volume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    avg_detection_time: 2.3,
    system_health: "healthy",
    detection_rate: 94.7,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Real-time Monitor</h1>
          <p className="text-slate-600 text-lg">Live transaction monitoring and anomaly detection</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-slate-900">{stats.active_transactions.toLocaleString()}</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Active monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-red-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10"></div>
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Anomalies Detected</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-slate-900">{stats.anomalies_detected.toLocaleString()}</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Flagged transactions
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10"></div>
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Volume</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.total_volume)}</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Transaction value
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10"></div>
            <CardHeader className="pb-2 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Detection Time</CardTitle>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-slate-900">{stats.avg_detection_time.toFixed(1)}s</div>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Response time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Live Transactions</CardTitle>
                </div>
                <Button
                  onClick={() => setIsMonitoring(!isMonitoring)}
                  variant={isMonitoring ? "destructive" : "default"}
                  size="sm"
                  className="rounded-full font-medium"
                >
                  {isMonitoring ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </>
                  )}
                </Button>
              </div>
              <CardDescription className="text-slate-600">Real-time transaction monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          transaction.is_anomaly
                            ? "border-red-200 bg-gradient-to-r from-red-50 to-red-100 hover:shadow-md"
                            : "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  transaction.is_anomaly ? "bg-red-500" : "bg-green-500"
                                }`}
                              ></div>
                              {transaction.from_account || "Unknown"} → {transaction.to_account || "Unknown"}
                            </div>
                            <div className="text-sm text-slate-600">
                              {transaction.timestamp ? formatDate(transaction.timestamp) : "N/A"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-slate-900">
                              {formatCurrency(transaction.amount || 0)}
                            </div>
                            <div className="text-xs">
                              {transaction.is_anomaly ? (
                                <span className="text-red-600 font-medium bg-red-100 px-2 py-1 rounded-full">
                                  Anomaly
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                  Normal
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {isMonitoring ? "Waiting for transactions..." : "No transactions available"}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        {isMonitoring ? "Monitoring active" : "Start monitoring to see live data"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
            <CardHeader className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">System Alerts</CardTitle>
              </div>
              <CardDescription className="text-slate-600">Recent system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          alert.severity === "critical"
                            ? "border-red-200 bg-gradient-to-r from-red-50 to-red-100"
                            : "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1 rounded-full ${
                              alert.severity === "critical" ? "bg-red-500" : "bg-yellow-500"
                            }`}
                          >
                            <AlertTriangle className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">{alert.message}</div>
                            <div className="text-xs text-slate-600 mt-1">
                              {alert.timestamp ? formatDate(alert.timestamp) : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {isMonitoring ? "No alerts at the moment" : "Start monitoring to see alerts"}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">System running smoothly</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900">System Health</CardTitle>
            </div>
            <CardDescription className="text-slate-600">Current system performance and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Detection Rate</span>
                  <span className="font-semibold text-slate-900">{stats.detection_rate?.toFixed(1) || 94.7}%</span>
                </div>
                <div className="relative">
                  <Progress value={stats.detection_rate || 94.7} className="h-3 bg-slate-100" />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.detection_rate || 94.7}%`,
                      background: "linear-gradient(90deg, #10b981, #059669)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Response Time</span>
                  <span className="font-semibold text-slate-900">{stats.avg_detection_time.toFixed(1)}s</span>
                </div>
                <div className="relative">
                  <Progress value={(stats.avg_detection_time / 5) * 100} className="h-3 bg-slate-100" />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(stats.avg_detection_time / 5) * 100}%`,
                      background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">System Status</span>
                  <span className="font-semibold text-green-600 capitalize">{stats.system_health || "Healthy"}</span>
                </div>
                <div className="relative">
                  <Progress value={100} className="h-3 bg-slate-100" />
                  <div
                    className="absolute top-0 left-0 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: "100%",
                      background: "linear-gradient(90deg, #10b981, #059669)",
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TransactionMonitor
