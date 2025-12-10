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
        gradient: 'from-blue-600 via-blue-500 to-blue-700',
        border: 'border-blue-400',
        iconBg: 'bg-blue-500',
        titleColor: 'text-blue-900'
      },
      green: {
        gradient: 'from-green-600 via-green-500 to-green-700',
        border: 'border-green-400',
        iconBg: 'bg-green-500',
        titleColor: 'text-green-900'
      },
      purple: {
        gradient: 'from-purple-600 via-purple-500 to-purple-700',
        border: 'border-purple-400',
        iconBg: 'bg-purple-500',
        titleColor: 'text-purple-900'
      },
      orange: {
        gradient: 'from-orange-600 via-orange-500 to-orange-700',
        border: 'border-orange-400',
        iconBg: 'bg-orange-500',
        titleColor: 'text-orange-900'
      },
      pink: {
        gradient: 'from-pink-600 via-pink-500 to-pink-700',
        border: 'border-pink-400',
        iconBg: 'bg-pink-500',
        titleColor: 'text-pink-900'
      },
      indigo: {
        gradient: 'from-indigo-600 via-indigo-500 to-indigo-700',
        border: 'border-indigo-400',
        iconBg: 'bg-indigo-500',
        titleColor: 'text-indigo-900'
      },
      gray: {
        gradient: 'from-gray-700 via-gray-600 to-gray-800',
        border: 'border-gray-400',
        iconBg: 'bg-gray-500',
        titleColor: 'text-gray-900'
      }
    }
    
    return colors[color || 'blue']
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

  // Check if this is a card data bubble (has card-specific fields)
  const isCardData = title === "معلومات البطاقة" || data["رقم البطاقة"] || data["نوع البطاقة"]

  // Render credit card style for card data (both layouts use same design)
  if (isCardData) {
    const cardNumber = data["رقم البطاقة"] || data["Card Number"] || "•••• •••• •••• ••••"
    const expiryDate = data["تاريخ الانتهاء"] || data["Expiry"] || "••/••"
    const cvv = data["CVV"] || data["الكود"] || "•••"
    const holderName = data["اسم حامل البطاقة"] || data["Card Holder"] || "CARD HOLDER"
    const cardType = data["نوع البطاقة"] || data["Card Type"] || data["البنك"] || "CARD"
    
    return (
      <div className="flex flex-col gap-3" style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}>
        {/* Credit Card */}
        <div 
          className={`relative bg-gradient-to-br ${colorStyles.gradient} rounded-xl shadow-lg p-4 text-white overflow-hidden`}
          style={{ aspectRatio: '1.586/1', maxWidth: '400px' }}
        >
          {/* Card Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Card Content */}
          <div className="relative h-full flex flex-col justify-between">
            {/* Top Section - Card Type & Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {icon && <span className="text-2xl">{icon}</span>}
                {isLatest && (
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                    ⭐ جديد
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-base font-bold tracking-wider">{cardType}</div>
                {timestamp && (
                  <div className="text-xs opacity-80">{formatRelativeTime(timestamp)}</div>
                )}
              </div>
            </div>

            {/* Middle Section - Card Number */}
            <div className="flex flex-col gap-1">
              <div className="text-xs opacity-70">رقم البطاقة</div>
              <div 
                className="text-xl font-bold tracking-widest"
                style={{ direction: "ltr", fontFamily: "monospace" }}
              >
                {cardNumber}
              </div>
            </div>

            {/* Bottom Section - Expiry, CVV & Holder */}
            <div className="flex items-end justify-between">
              <div className="flex gap-6">
                <div>
                  <div className="text-xs opacity-70">تاريخ الانتهاء</div>
                  <div className="text-base font-bold" style={{ direction: "ltr" }}>{expiryDate}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">CVV</div>
                  <div className="text-base font-bold" style={{ direction: "ltr" }}>{cvv}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-70">اسم حامل البطاقة</div>
                <div className="text-base font-bold uppercase">{holderName}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Below Card */}
        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200" style={{ maxWidth: '400px' }}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-gray-700">{title}</h4>
            {getStatusBadge()}
          </div>
          
          {/* Other fields not shown on card */}
          <div className="space-y-1">
            {Object.entries(data).map(([key, value]) => {
              // Skip fields already shown on card
              if (["رقم البطاقة", "تاريخ الانتهاء", "CVV", "اسم حامل البطاقة", "نوع البطاقة", "البنك"].includes(key)) {
                return null
              }
              if (value === undefined || value === null) return null
              
              return (
                <div key={key} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-semibold text-gray-900">{value?.toString()}</span>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          {showActions && actions && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default vertical layout for non-card data
  if (layout === "vertical") {
    return (
      <div 
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md p-3 border-2 ${colorStyles.border} transition-all hover:shadow-lg flex flex-col h-full`}
        style={{ fontFamily: 'Cairo, Tajawal, sans-serif' }}
      >
        {/* Header */}
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
          
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
            {isLatest && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                ⭐
              </span>
            )}
            {getStatusBadge()}
          </div>
        </div>

        {/* Data Fields */}
        <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
          {Object.entries(data).map(([key, value]) => {
            if (value === undefined || value === null) return null
            return (
              <div key={key} className="flex flex-col bg-white/90 rounded-lg p-2 shadow-sm">
                <span className="text-xs font-semibold text-gray-600 mb-1">{key}</span>
                <span className="text-gray-900 font-bold break-words text-base">
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

  // Horizontal layout
  return (
    <div 
      className={`bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-md p-3 border-2 ${colorStyles.border} transition-all hover:shadow-lg`}
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

        {/* Data Fields */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(data).map(([key, value]) => {
            if (value === undefined || value === null) return null
            return (
              <div key={key} className="flex flex-col bg-white/90 rounded-lg p-2 shadow-sm min-w-0">
                <span className="text-xs font-semibold text-gray-600 mb-0.5 truncate">{key}</span>
                <span 
                  className="text-gray-900 font-bold truncate text-sm"
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
