"use client"

import { ReactNode } from "react"

interface DataBubbleProps {
  title: string
  data: Record<string, any>
  timestamp?: string | Date
  status?: "pending" | "approved" | "rejected"
  showActions?: boolean
  isLatest?: boolean
  actions?: ReactNode
  icon?: string
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "indigo" | "gray"
}

export function DataBubble({
  title,
  data,
  timestamp,
  status,
  showActions,
  isLatest,
  actions,
  icon,
  color
}: DataBubbleProps) {
  // Get status badge
  const getStatusBadge = () => {
    if (!status) return null
    
    const badges = {
      pending: { text: "⏳ قيد المراجعة", className: "bg-yellow-100 text-yellow-800" },
      approved: { text: "✓ تم القبول", className: "bg-green-100 text-green-800" },
      rejected: { text: "✗ تم الرفض", className: "bg-red-100 text-red-800" }
    }
    
    const badge = badges[status]
    if (!badge) return null
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  // Get styles for latest
  const getLatestStyles = () => {
    if (!isLatest) return {
      gradient: 'from-white to-gray-50',
      border: 'border-gray-300',
      shadow: 'shadow-sm'
    }
    
    return {
      gradient: 'from-blue-50 to-indigo-50',
      border: 'border-blue-400',
      shadow: 'shadow-md shadow-blue-100'
    }
  }
  
  const styles = getLatestStyles()

  // Format relative time
  const formatRelativeTime = (timestamp: string | Date) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    
    // التأكد من أن الوقت صحيح (ليس في المستقبل)
    if (diffMs < 0) return 'الآن'
    
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 10) return 'الآن'
    if (diffSecs < 60) return 'منذ لحظات'
    if (diffMins === 1) return 'منذ دقيقة'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours === 1) return 'منذ ساعة'
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays === 1) return 'منذ يوم'
    if (diffDays < 30) return `منذ ${diffDays} يوم`
    
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths === 1) return 'منذ شهر'
    if (diffMonths < 12) return `منذ ${diffMonths} شهر`
    
    const diffYears = Math.floor(diffDays / 365)
    return `منذ ${diffYears} سنة`
  }

  return (
    <div 
      className={`bg-gradient-to-br ${styles.gradient} rounded-lg ${styles.shadow} p-3 landscape:p-2 border ${styles.border} transition-all hover:shadow-lg h-full flex flex-col text-sm landscape:text-xs`}
      style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2 landscape:mb-1 pb-2 landscape:pb-1 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1">
          {icon && (
            <span className="text-lg">
              {icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm landscape:text-xs font-bold text-gray-900 truncate">{title}</h3>
            {isLatest && (
              <span className="inline-block mt-0.5 px-1.5 py-0.5 landscape:px-1 landscape:py-0 bg-blue-600 text-white text-[9px] landscape:text-[8px] font-medium rounded-full">
                جديد
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
          {getStatusBadge()}
          {timestamp && (
            <span className="text-[10px] landscape:text-[8px] text-gray-500 whitespace-nowrap">
              {formatRelativeTime(timestamp)}
            </span>
          )}
        </div>
      </div>

      {/* Data Fields */}
      <div className="space-y-1.5 landscape:space-y-1 flex-1">
        {Object.entries(data).map(([key, value]) => {
          if (value === undefined || value === null) return null
          return (
            <div key={key} className="flex justify-between items-center gap-2 bg-white/70 rounded p-1.5 landscape:p-1">
              <span className="text-[11px] landscape:text-[9px] font-medium text-gray-500 flex-shrink-0">{key}:</span>
              <span 
                className={`text-gray-900 font-bold text-right truncate ${
                  key === "رقم البطاقة" ? "text-xl landscape:text-base" : "text-lg landscape:text-sm"
                }`}
                style={key === "رقم البطاقة" ? { direction: "ltr", unicodeBidi: "plaintext" } : {}}
              >
                {value?.toString() || "-"}
              </span>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      {showActions && actions && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          {actions}
        </div>
      )}
    </div>
  )
}
