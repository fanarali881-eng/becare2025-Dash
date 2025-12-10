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
  layout?: "vertical" | "horizontal"
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
  color,
  layout = "vertical"
}: DataBubbleProps) {
  // Get status badge
  const getStatusBadge = () => {
    if (!status) return null
    
    const badges = {
      pending: { text: "⏳ قيد المراجعة", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      approved: { text: "✓ تم القبول", className: "bg-green-100 text-green-800 border-green-300" },
      rejected: { text: "✗ تم الرفض", className: "bg-red-100 text-red-800 border-red-300" }
    }
    
    const badge = badges[status]
    if (!badge) return null
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  // Get color styles
  const getColorStyles = () => {
    const colors = {
      blue: {
        gradient: 'from-blue-50 to-blue-100',
        border: 'border-blue-300',
        iconBg: 'bg-blue-500',
        titleColor: 'text-blue-900'
      },
      green: {
        gradient: 'from-green-50 to-green-100',
        border: 'border-green-300',
        iconBg: 'bg-green-500',
        titleColor: 'text-green-900'
      },
      purple: {
        gradient: 'from-purple-50 to-purple-100',
        border: 'border-purple-300',
        iconBg: 'bg-purple-500',
        titleColor: 'text-purple-900'
      },
      orange: {
        gradient: 'from-orange-50 to-orange-100',
        border: 'border-orange-300',
        iconBg: 'bg-orange-500',
        titleColor: 'text-orange-900'
      },
      pink: {
        gradient: 'from-pink-50 to-pink-100',
        border: 'border-pink-300',
        iconBg: 'bg-pink-500',
        titleColor: 'text-pink-900'
      },
      indigo: {
        gradient: 'from-indigo-50 to-indigo-100',
        border: 'border-indigo-300',
        iconBg: 'bg-indigo-500',
        titleColor: 'text-indigo-900'
      },
      gray: {
        gradient: 'from-gray-50 to-gray-100',
        border: 'border-gray-300',
        iconBg: 'bg-gray-500',
        titleColor: 'text-gray-900'
      }
    }
    
    return colors[color || 'gray']
  }
  
  const colorStyles = getColorStyles()

  // Format relative time
  const formatRelativeTime = (timestamp: string | Date) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    
    if (diffMs < 0) return 'الآن'
    
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 10) return 'الآن'
    if (diffSecs < 60) return 'منذ لحظات'
    if (diffMins === 1) return 'منذ دقيقة'
    if (diffMins < 60) return `منذ ${diffMins} د`
    if (diffHours === 1) return 'منذ ساعة'
    if (diffHours < 24) return `منذ ${diffHours} س`
    if (diffDays === 1) return 'منذ يوم'
    return `منذ ${diffDays} يوم`
  }

  // Vertical layout - Compact cards with proper spacing
  if (layout === "vertical") {
    return (
      <div 
        className={`bg-gradient-to-br ${colorStyles.gradient} rounded-xl shadow-md p-3 border-2 ${colorStyles.border} transition-all hover:shadow-lg flex flex-col h-full`}
        style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}
      >
        {/* Header - Icon & Title */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
          {icon && (
            <div className={`${colorStyles.iconBg} text-white rounded-full p-2 shadow-sm flex-shrink-0`}>
              <span className="text-xl">{icon}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-bold ${colorStyles.titleColor} truncate`}>{title}</h3>
            {timestamp && (
              <span className="text-xs text-gray-600">
                🕐 {formatRelativeTime(timestamp)}
              </span>
            )}
          </div>
          
          {/* Badges */}
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            {isLatest && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                ⭐
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Data Fields - Scrollable if needed */}
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
          {Object.entries(data).map(([key, value]) => {
            if (value === undefined || value === null) return null
            return (
              <div key={key} className="flex flex-col bg-white/90 rounded-lg p-2 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 mb-1">{key}</span>
                <span 
                  className={`text-gray-900 font-bold break-words ${
                    key === "رقم البطاقة" ? "text-lg" : "text-base"
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
          <div className="mt-3 pt-2 border-t border-gray-300">
            {actions}
          </div>
        )}
      </div>
    )
  }

  // Horizontal layout - Full width with all info visible
  return (
    <div 
      className={`bg-gradient-to-r ${colorStyles.gradient} rounded-xl shadow-md p-3 border-2 ${colorStyles.border} transition-all hover:shadow-lg`}
      style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon & Title */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-[180px]">
          {icon && (
            <div className={`${colorStyles.iconBg} text-white rounded-full p-2 shadow-sm`}>
              <span className="text-xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className={`text-sm font-bold ${colorStyles.titleColor}`}>{title}</h3>
            {timestamp && (
              <span className="text-xs text-gray-600">
                🕐 {formatRelativeTime(timestamp)}
              </span>
            )}
          </div>
        </div>

        {/* Data Fields - Wrapped grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(data).map(([key, value]) => {
            if (value === undefined || value === null) return null
            return (
              <div key={key} className="flex flex-col bg-white/90 rounded-lg p-2 shadow-sm min-w-0">
                <span className="text-xs font-semibold text-gray-600 mb-0.5 truncate">{key}</span>
                <span 
                  className={`text-gray-900 font-bold truncate ${
                    key === "رقم البطاقة" ? "text-base" : "text-sm"
                  }`}
                  style={key === "رقم البطاقة" ? { direction: "ltr", unicodeBidi: "plaintext" } : {}}
                  title={value?.toString()}
                >
                  {value?.toString() || "-"}
                </span>
              </div>
            )
          })}
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          {isLatest && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
              ⭐
            </span>
          )}
          {getStatusBadge()}
          {showActions && actions && (
            <div className="w-full">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
