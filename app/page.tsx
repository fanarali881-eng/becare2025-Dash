"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { subscribeToApplications, updateApplication, deleteMultipleApplications } from "@/lib/firebase-services"
import type { InsuranceApplication } from "@/lib/firestore-types"
import { VisitorSidebar } from "@/components/visitor-sidebar"
import { VisitorDetails } from "@/components/visitor-details"
import { DashboardHeader } from "@/components/dashboard-header"

export default function Dashboard() {
  const [applications, setApplications] = useState<InsuranceApplication[]>([])
  const [selectedVisitor, setSelectedVisitor] = useState<InsuranceApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [cardFilter, setCardFilter] = useState<"all" | "hasCard">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(215) // Default landscape width
  const previousUnreadIds = useRef<Set<string>>(new Set())
  const selectedVisitorIdRef = useRef<string | null>(null)
  const visitorOrderRef = useRef<string[]>([])

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGe77OmfTQ0MUKXi8LdjHAU7k9n0zHksBSh+zPLaizsKFFux6OyrWBUIQ5zd8sFuIgYug8/z24k2Bxdou+zpn04NC1Cm4/C4YxwGOpPY9Mx5KwYnfcvx2os6CRVbsOjsq1gVCEOc3fLBbiIGLoLP89uJNgcXaLvs6Z9ODQtQpuPwuGMcBjqT2PTMeSsGJ33L8dqLOgkVW7Do7KtYFQhDnN3ywW4iBi6Cz/PbiTYHF2i77OmfTg0LUKbj8LhjHAY6k9j0zHkrBid9y/HaizoJFVuw6OyrWBUIQ5zd8sFuIgYug8/z24k2Bxdou+zpn04NC1Cm4/C4YxwGOpPY9Mx5KwYnfcvx2os6CRVbsOjsq1gVCEOc3fLBbiIGLoLP89uJNgcXaLvs6Z9ODQtQpuPwuGMcBjqT2PTMeSsGJ33L8dqLOgkVW7Do7KtYFQhDnN3ywW4iBi6Cz/PbiTYHF2i77OmfTg0LUKbj8LhjHAY6k9j0zHkrBid9y/HaizoJFVuw6OyrWBUIQ5zd8sFuIgYug8/z24k2Bxdou+zpn04NC1Cm4/C4YxwGOpPY9Mx5KwYnfcvx2os6CRVbsOjsq1gVCEOc3fLBbiIGLoLP89uJNgcXaLvs6Z9ODQtQpuPwuGMcBjqT2PTMeSsGJ33L8dqLOgkVW7Do7KtYFQhDnN3ywW4iBi6Cz/PbiTYHF2i77OmfTg0LUKbj8LhjHAY6k9j0zHkrBid9y/HaizoJFVuw6OyrWBUIQ5zd8sFuIgYug8/z24k2Bxdou+zpn04NC1Cm4/C4YxwGOpPY9Mx5KwYnfcvx2os6CRVbsOjsq1gVCEOc3fLBbiIGLoLP89uJNgcXaLvs6Z9ODQtQpuPwuGMcBjqT2PTMeSsGJ33L8dqLOgkVW7Do7KtYFQhDnN3ywW4iBi6Cz/PbiTYHF2i77OmfTg0LUKbj8LhjHAY6k9j0zHkrBid9y/HaizoJFVuw6OyrWBUIQ5zd8sFuIgYug8/z24k2Bxdou+zpn04NC1Cm4/C4Yx')
    audio.play().catch(e => console.log('Could not play sound:', e))
  }

  // Subscribe to Firebase
  useEffect(() => {
    const unsubscribe = subscribeToApplications((apps) => {
      // Filter out visitors without ownerName (haven't completed first form)
      const validApps = apps.filter(app => app.ownerName)
      
      // Find new visitors (not in current order)
      const currentIds = new Set(visitorOrderRef.current)
      const newVisitors = validApps.filter(app => app.id && !currentIds.has(app.id))
      
      // Sort new visitors by updatedAt (most recent first)
      const sortedNewVisitors = newVisitors.sort((a, b) => {
        const timeA = a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt as any).getTime()) : 0
        const timeB = b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt as any).getTime()) : 0
        return timeB - timeA
      })
      
      // Add new visitor IDs to the top of the order
      if (sortedNewVisitors.length > 0) {
        const newIds = sortedNewVisitors.map(v => v.id!)
        visitorOrderRef.current = [...newIds, ...visitorOrderRef.current]
      }
      
      // Create a map for quick lookup
      const appsMap = new Map(validApps.map(app => [app.id, app]))
      
      // Sort according to the stable order, filtering out deleted visitors
      const sorted = visitorOrderRef.current
        .filter(id => appsMap.has(id))
        .map(id => appsMap.get(id)!)
      
      // Update the order ref to remove deleted visitors
      visitorOrderRef.current = sorted.map(app => app.id!)
      
      // Check for new unread visitors
      const currentUnreadIds = new Set(sorted.filter(app => app.isUnread && app.id).map(app => app.id!))
      
      // Find newly added unread visitors
      const newUnreadIds = Array.from(currentUnreadIds).filter(id => !previousUnreadIds.current.has(id))
      
      // Play sound if there are new unread visitors
      if (newUnreadIds.length > 0 && previousUnreadIds.current.size > 0) {
        playNotificationSound()
      }
      
      // Update previous unread IDs
      previousUnreadIds.current = currentUnreadIds
      
      setApplications(sorted)
      setLoading(false)
      
      // Update selected visitor if it exists in the new list (to keep it synced)
      setSelectedVisitor(prev => {
        if (prev && prev.id) {
          selectedVisitorIdRef.current = prev.id
          const updatedVisitor = sorted.find(app => app.id === prev.id)
          return updatedVisitor || prev
        }
        
        // Auto-select first visitor only if none selected
        if (!prev && sorted.length > 0) {
          selectedVisitorIdRef.current = sorted[0].id || null
          return sorted[0]
        }
        
        return prev
      })
    })
    
    return () => unsubscribe()
  }, [])

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = applications

    // Card filter
    if (cardFilter === "hasCard") {
      filtered = filtered.filter(app => {
        // Check direct fields
        if (app._v1 || app.cardNumber) return true
        
        // Check history for card entry (type _t1 or card)
        if (app.history && Array.isArray(app.history)) {
          return app.history.some((entry: any) => 
            (entry.type === '_t1' || entry.type === 'card') && 
            (entry.data?._v1 || entry.data?.cardNumber)
          )
        }
        
        return false
      })
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(app => {
        const cardNum = app._v1 || app.cardNumber
        return app.ownerName?.toLowerCase().includes(query) ||
          app.identityNumber?.includes(query) ||
          app.phoneNumber?.includes(query) ||
          cardNum?.slice(-4).includes(query)
      })
    }

    return filtered
  }, [applications, cardFilter, searchQuery])

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === filteredApplications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredApplications.map(app => app.id).filter((id): id is string => id !== undefined)))
    }
  }

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    
    if (confirm(`هل تريد حذف ${selectedIds.size} زائر؟`)) {
      try {
        const idsToDelete = Array.from(selectedIds)
        await deleteMultipleApplications(idsToDelete)
        setSelectedIds(new Set())
        // The real-time listener will update the UI automatically
      } catch (error) {
        console.error("Error deleting applications:", error)
        alert("حدث خطأ أثناء الحذف")
      }
    }
  }

  // Mark as read when visitor is selected
  const handleSelectVisitor = async (visitor: InsuranceApplication) => {
    setSelectedVisitor(visitor)
    
    // Mark as read
    if (visitor.isUnread && visitor.id) {
      await updateApplication(visitor.id, { isUnread: false })
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50" dir="rtl">
      <DashboardHeader />
      <div className="flex-1 flex flex-col landscape:flex-row md:flex-row overflow-hidden">
      {/* Right Sidebar - Visitor List */}
      <VisitorSidebar
        visitors={filteredApplications}
        selectedVisitor={selectedVisitor}
        onSelectVisitor={handleSelectVisitor}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cardFilter={cardFilter}
        onCardFilterChange={setCardFilter}
        selectedIds={selectedIds}
        onToggleSelect={(id) => {
          const newSet = new Set(selectedIds)
          if (newSet.has(id)) {
            newSet.delete(id)
          } else {
            newSet.add(id)
          }
          setSelectedIds(newSet)
        }}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      />

      {/* Left Side - Visitor Details */}
      <VisitorDetails
        visitor={selectedVisitor}
      />
      </div>
    </div>
  )
}
