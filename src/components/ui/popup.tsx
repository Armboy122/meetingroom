'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface PopupState {
  isOpen: boolean
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

let showPopupFunction: ((popup: Omit<PopupState, 'isOpen'>) => void) | null = null

export const showPopup = (popup: Omit<PopupState, 'isOpen'>) => {
  if (showPopupFunction) {
    showPopupFunction(popup)
  }
}

export const showErrorPopup = (title: string, message: string) => {
  showPopup({
    type: 'error',
    title,
    message
  })
}

export const showSuccessPopup = (title: string, message: string) => {
  showPopup({
    type: 'success',
    title,
    message
  })
}

export const showConfirmPopup = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก'
) => {
  showPopup({
    type: 'warning',
    title,
    message,
    onConfirm,
    onCancel,
    confirmText,
    cancelText
  })
}

export function PopupProvider() {
  const [popup, setPopup] = useState<PopupState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    showPopupFunction = (newPopup: Omit<PopupState, 'isOpen'>) => {
      setPopup({ ...newPopup, isOpen: true })
    }

    return () => {
      showPopupFunction = null
    }
  }, [])

  const handleClose = () => {
    setPopup(prev => ({ ...prev, isOpen: false }))
    if (popup.onCancel) {
      popup.onCancel()
    }
  }

  const handleConfirm = () => {
    setPopup(prev => ({ ...prev, isOpen: false }))
    if (popup.onConfirm) {
      popup.onConfirm()
    }
  }

  const getIcon = () => {
    switch (popup.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getButtonColor = () => {
    switch (popup.type) {
      case 'error':
        return 'destructive'
      case 'success':
        return 'default'
      case 'warning':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (!mounted || !popup.isOpen) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <CardTitle className="text-lg">{popup.title}</CardTitle>
                {popup.message && (
                  <CardDescription className="mt-1">
                    {popup.message}
                  </CardDescription>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-auto p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex gap-2 justify-end">
            {popup.onConfirm && (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  {popup.cancelText || 'ยกเลิก'}
                </Button>
                <Button
                  variant={getButtonColor()}
                  onClick={handleConfirm}
                >
                  {popup.confirmText || 'ยืนยัน'}
                </Button>
              </>
            )}
            {!popup.onConfirm && (
              <Button
                variant={getButtonColor()}
                onClick={handleClose}
              >
                ตกลง
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}