import { useState, useCallback } from 'react'
import { LoadingState } from '@/types'

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: false,
    error: null
  })

  const authenticateAdmin = useCallback(async (password: string) => {
    setLoadingState({ loading: true, error: null })
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        setIsAuthenticated(true)
        setAdminPassword('')
        setLoadingState({ loading: false, error: null })
        return true
      } else {
        const data = await response.json()
        setLoadingState({ 
          loading: false, 
          error: data.error || 'รหัสผ่านไม่ถูกต้อง' 
        })
        return false
      }
    } catch (error) {
      setLoadingState({
        loading: false,
        error: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน'
      })
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setAdminPassword('')
    setLoadingState({ loading: false, error: null })
  }, [])

  return {
    isAuthenticated,
    adminPassword,
    setAdminPassword,
    showPassword,
    setShowPassword,
    ...loadingState,
    authenticateAdmin,
    logout
  }
}