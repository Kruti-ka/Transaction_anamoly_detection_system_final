import { Badge } from "./ui/badge"

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      variant: "warning",
      className:
        "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 hover:from-yellow-200 hover:to-yellow-300",
    },
    investigating: {
      label: "Investigating",
      variant: "primary",
      className:
        "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 hover:from-blue-200 hover:to-blue-300",
    },
    confirmed: {
      label: "Confirmed",
      variant: "destructive",
      className:
        "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 hover:from-red-200 hover:to-red-300",
    },
    false_positive: {
      label: "False Positive",
      variant: "success",
      className:
        "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 hover:from-green-200 hover:to-green-300",
    },
    default: {
      label: "Unknown",
      variant: "outline",
      className: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border-slate-300",
    },
  }

  const config = statusConfig[status.toLowerCase()] || statusConfig.default

  return (
    <Badge
      variant={config.variant}
      className={`rounded-full font-medium transition-all duration-200 ${config.className}`}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge
