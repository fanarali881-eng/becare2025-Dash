"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null | { email: string; uid: string }
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | { email: string; uid: string }>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for admin bypass in localStorage
    const isBypass = typeof window !== 'undefined' && localStorage.getItem("admin_bypass") === "true"
    
    if (isBypass) {
      setUser({ email: "adna@adna.com", uid: "admin-bypass-id" })
      setLoading(false)
      if (pathname === "/login") {
        router.push("/")
      }
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)

      // Redirect logic
      if (!user && pathname !== "/login") {
        router.push("/login")
      } else if (user && pathname === "/login") {
        router.push("/")
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("admin_bypass")
      }
      await auth.signOut()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
