const DetectionMethodChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1

  return (
    <div className="w-full space-y-4">
      {data.map((method, index) => (
        <div key={index} className="group hover:bg-slate-50 rounded-xl p-4 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: method.color }}></div>
              <span className="text-sm font-medium text-slate-700">{method.method}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{Math.round((method.count / total) * 100)}%</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{method.count}</span>
            </div>
          </div>
          <div className="relative">
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{
                  width: `${(method.count / total) * 100}%`,
                  backgroundColor: method.color,
                  background: `linear-gradient(90deg, ${method.color}, ${method.color}dd)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DetectionMethodChart
