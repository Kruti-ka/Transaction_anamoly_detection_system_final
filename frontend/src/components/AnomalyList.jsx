"use client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card"
import { Progress } from "./ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { apiService } from "../services/api"

const AnomalyList = ({ anomalies, selectedAnomaly, setSelectedAnomaly, setAnomalies }) => {
  const getRiskLevel = (score) => {
    if (score >= 81)
      return { level: "Critical", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" }
    if (score >= 61)
      return { level: "High", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
    if (score >= 31)
      return { level: "Medium", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" }
    return { level: "Low", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" }
  }

  const handleStatusChange = async (anomaly, newStatus) => {
    try {
      await apiService.updateAnomalyStatus(anomaly.id, newStatus)
      setAnomalies(anomalies.map((a) => (a.id === anomaly.id ? { ...a, status: newStatus } : a)))
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900">Anomalies</CardTitle>
        </div>
        <CardDescription className="text-slate-600">Detected suspicious transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {anomalies.map((anomaly) => {
            const risk = getRiskLevel(anomaly.anomaly_score)
            const isSelected = selectedAnomaly?.id === anomaly.id

            return (
              <Card
                key={anomaly.id}
                className={`cursor-pointer transition-all duration-300 border-0 shadow-sm hover:shadow-md ${
                  isSelected
                    ? "ring-2 ring-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-lg"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => setSelectedAnomaly(anomaly)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${risk.color.replace("text-", "bg-")}`}></div>
                        {anomaly.transaction_id}
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        <span className="font-medium">{anomaly.from_account}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-medium">{anomaly.to_account}</span>
                      </CardDescription>
                    </div>
                    <Select
                      value={anomaly.status}
                      onValueChange={(value) => handleStatusChange(anomaly, value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectTrigger className="w-[140px] border-slate-200 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="false_positive">False Positive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Amount</span>
                        <div className="font-semibold text-slate-900 text-lg">${anomaly.amount.toLocaleString()}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 font-medium">Risk Level</span>
                        <div className={`font-semibold ${risk.color} flex items-center gap-1`}>
                          {risk.level === "Critical" && <AlertTriangle className="h-3 w-3" />}
                          {risk.level === "High" && <TrendingUp className="h-3 w-3" />}
                          {risk.level === "Medium" && <Clock className="h-3 w-3" />}
                          {risk.level}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Risk Score</span>
                        <span className="font-mono text-sm font-semibold text-slate-900">
                          {anomaly.anomaly_score.toFixed(1)}/100
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={anomaly.anomaly_score} className="h-2 bg-slate-100" />
                        <div
                          className="absolute top-0 left-0 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${anomaly.anomaly_score}%`,
                            background:
                              anomaly.anomaly_score >= 81
                                ? "linear-gradient(90deg, #ef4444, #dc2626)"
                                : anomaly.anomaly_score >= 61
                                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                  : anomaly.anomaly_score >= 31
                                    ? "linear-gradient(90deg, #eab308, #ca8a04)"
                                    : "linear-gradient(90deg, #10b981, #059669)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {anomalies.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No anomalies detected</p>
              <p className="text-slate-400 text-sm mt-1">Your system is running smoothly</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnomalyList
