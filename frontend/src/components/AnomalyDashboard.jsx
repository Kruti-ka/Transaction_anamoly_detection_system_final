"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Activity, AlertTriangle, Clock, TrendingUp, BarChart3, Shield, Users, Zap } from "lucide-react"
import { useApi } from "../hooks/useApi"
import { apiService } from "../services/api"
import DetectionMethodChart from "./DetectionMethodChart"
import AnomalyList from "./AnomalyList"
import AccountStatusChart from "./AccountStatusChart"

const AnomalyDashboard = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch real data from backend
  const {
    data: dashboardMetrics,
    loading: metricsLoading,
    error: metricsError,
  } = useApi(apiService.getDashboardMetrics)
  const { data: anomaliesData, loading: anomaliesLoading, error: anomaliesError } = useApi(apiService.getAnomalies)
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
  } = useApi(apiService.getTransactions)
  const { data: networkData, loading: networkLoading, error: networkError } = useApi(apiService.getNetworkData)

  // Use real data or fallback to defaults
  const analyticsData = dashboardMetrics || {
    total_anomalies: 0,
    total_transactions: 0,
    avg_risk_score: 0,
    detection_rate: 0,
    avg_response_time: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    false_positive_rate: 0,
    avg_detection_time: 0,
    statistical_latency: 0,
    ml_latency: 0,
    network_latency: 0,
  }

  // Process real anomalies data
  const anomalies = anomaliesData?.anomalies || []

  // Process real transactions data
  const transactions = transactionsData?.transactions || []

  // Process real accounts from network data
  const accounts = networkData?.nodes || []

  // Calculate detection methods from real data
  const detectionMethods = useMemo(() => {
    if (!anomalies.length) return []

    const methodCounts = {}
    anomalies.forEach((anomaly) => {
      const method = anomaly.detection_method || "unknown"
      methodCounts[method] = (methodCounts[method] || 0) + 1
    })

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
    return Object.entries(methodCounts).map(([method, count], index) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      count,
      color: colors[index % colors.length],
    }))
  }, [anomalies])

  if (metricsLoading || anomaliesLoading || transactionsLoading || networkLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
              style={{ animationDelay: "0.15s", animationDuration: "1.5s" }}
            ></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Loading Dashboard</h3>
            <p className="text-slate-600">Fetching your analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (metricsError || anomaliesError || transactionsError || networkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Unable to Load Data</h3>
            <p className="text-slate-600">There was an error loading your dashboard. Please try again.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Security Dashboard</h1>
          <p className="text-slate-600 text-lg">Monitor and analyze transaction anomalies in real-time</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-600">Total Anomalies</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{analyticsData.total_anomalies}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-xs text-slate-500 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-green-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
                <div className="text-3xl font-bold text-slate-900">{analyticsData.total_transactions}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-xs text-slate-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-600">Detection Rate</CardTitle>
                <div className="text-3xl font-bold text-slate-900">
                  {analyticsData.detection_rate?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-xs text-slate-500 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Accuracy rate
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-600">Response Time</CardTitle>
                <div className="text-3xl font-bold text-slate-900">
                  {analyticsData.avg_response_time?.toFixed(1) || 0}m
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-xs text-slate-500 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Avg detection time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="overview" className="space-y-6">
            <CardHeader className="border-b border-slate-100">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger
                  value="overview"
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 transition-all duration-200"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="anomalies"
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 transition-all duration-200"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Anomaly List
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 transition-all duration-200"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        Account Status Distribution
                      </CardTitle>
                    </div>
                    <CardDescription className="text-slate-600">
                      Proportion of normal, suspicious, and high-risk accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full">
                      {accounts.length > 0 ? (
                        <AccountStatusChart
                          data={[
                            {
                              name: "Normal Accounts",
                              value: accounts.filter((a) => !a.is_suspicious && (a.risk_score || 0) <= 80).length,
                            },
                            {
                              name: "Suspicious Accounts",
                              value: accounts.filter((a) => a.is_suspicious && (a.risk_score || 0) <= 80).length,
                            },
                            {
                              name: "High Risk / Anomalies",
                              value: accounts.filter((a) => (a.risk_score || 0) > 80).length,
                            },
                          ]}
                        />
                      ) : (
                        <div className="h-80 flex items-center justify-center">
                          <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                              <Users className="h-8 w-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No account data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Detection Methods</CardTitle>
                    </div>
                    <CardDescription className="text-slate-600">Anomalies by detection technique</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex flex-col justify-center overflow-y-auto">
                      {detectionMethods.length > 0 ? (
                        <DetectionMethodChart data={detectionMethods} />
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                            <BarChart3 className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">No detection method data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-6 px-6 pb-6">
              <div className="flex flex-wrap gap-3">
                {["all", "pending", "investigating", "confirmed", "false_positive"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full font-medium transition-all duration-200 ${
                      statusFilter === status
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {status.replace("_", " ").toUpperCase()}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnomalyList
                  anomalies={anomalies}
                  selectedAnomaly={selectedAnomaly}
                  setSelectedAnomaly={setSelectedAnomaly}
                />

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Anomaly Details</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedAnomaly ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-100">
                          <h4 className="font-semibold mb-3 text-slate-900 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            Transaction Info
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Transaction ID:</span>
                              <span className="font-mono text-sm bg-white px-2 py-1 rounded border">
                                {selectedAnomaly.transaction_id}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Amount:</span>
                              <span className="font-semibold text-lg text-slate-900">
                                ${selectedAnomaly.amount?.toLocaleString() || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">From:</span>
                              <span className="text-sm text-slate-900">{selectedAnomaly.from_account || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">To:</span>
                              <span className="text-sm text-slate-900">{selectedAnomaly.to_account || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Timestamp:</span>
                              <span className="text-sm text-slate-900">
                                {selectedAnomaly.timestamp
                                  ? new Date(selectedAnomaly.timestamp).toLocaleString()
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl p-4 border border-slate-100">
                          <h4 className="font-semibold mb-3 text-slate-900 flex items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                            Detection Details
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Method:</span>
                              <span className="text-sm text-slate-900">
                                {selectedAnomaly.detection_method || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Risk Score:</span>
                              <span className="font-semibold text-slate-900">
                                {selectedAnomaly.anomaly_score || 0}/100
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600">Status:</span>
                              <Badge
                                variant={selectedAnomaly.status === "confirmed" ? "destructive" : "warning"}
                                className="rounded-full"
                              >
                                {selectedAnomaly.status ? selectedAnomaly.status.replace("_", " ") : "pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-slate-50 to-red-50 rounded-xl p-4 border border-slate-100">
                          <h4 className="font-semibold mb-3 text-slate-900 flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Reasons
                          </h4>
                          <ul className="space-y-2">
                            {selectedAnomaly.anomaly_reasons && selectedAnomaly.anomaly_reasons.length > 0 ? (
                              selectedAnomaly.anomaly_reasons.map((reason, index) => (
                                <li key={index} className="flex items-center gap-3 text-sm">
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                                  <span className="text-slate-700">{reason}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-slate-500 text-sm">No reasons provided</li>
                            )}
                          </ul>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button variant="destructive" size="sm" className="rounded-full font-medium">
                            Confirm Fraud
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full font-medium bg-transparent">
                            Mark False Positive
                          </Button>
                          <Button variant="secondary" size="sm" className="rounded-full font-medium">
                            Investigate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">Select an anomaly to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Model Performance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {["precision", "recall", "f1_score", "false_positive_rate"].map((metric) => (
                        <div key={metric} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {metric.replace("_", " ")}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {analyticsData[metric]?.toFixed(1) || 0}%
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={analyticsData[metric] || 0} className="h-2 bg-slate-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Detection Latency</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-slate-100">
                        <div className="text-4xl font-bold text-slate-900 mb-2">
                          {analyticsData.avg_detection_time?.toFixed(1) || 0}s
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Average Detection Time</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Statistical Methods</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {analyticsData.statistical_latency?.toFixed(1) || 0}s
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">ML Models</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {analyticsData.ml_latency?.toFixed(1) || 0}s
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Network Analysis</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {analyticsData.network_latency?.toFixed(1) || 0}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default AnomalyDashboard
