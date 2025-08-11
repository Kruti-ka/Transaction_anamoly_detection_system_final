const RiskIndicator = ({ score = 0 }) => {
  const getRiskColor = (score) => {
    if (score >= 81) return "bg-gradient-to-r from-red-500 to-red-600"
    if (score >= 61) return "bg-gradient-to-r from-orange-500 to-orange-600"
    if (score >= 31) return "bg-gradient-to-r from-yellow-500 to-yellow-600"
    return "bg-gradient-to-r from-green-500 to-green-600"
  }

  const getRiskLevel = (score) => {
    if (score >= 81) return { level: "Critical", color: "text-red-600" }
    if (score >= 61) return { level: "High", color: "text-orange-600" }
    if (score >= 31) return { level: "Medium", color: "text-yellow-600" }
    return { level: "Low", color: "text-green-600" }
  }

  const risk = getRiskLevel(score)

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${getRiskColor(score)}`} style={{ width: `${score}%` }} />
        </div>
      </div>
      <div className="text-sm font-medium">
        <span className={risk.color}>{risk.level}</span>
        <span className="ml-1 text-slate-500">({score}%)</span>
      </div>
    </div>
  )
}

export default RiskIndicator
