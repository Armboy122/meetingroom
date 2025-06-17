import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
  showDetails?: boolean
}

export function ErrorFallback({
  error,
  resetError,
  title = 'เกิดข้อผิดพลาด',
  message = 'ไม่สามารถโหลดข้อมูลได้ ลองใหม่อีกครั้ง',
  showDetails = false
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      
      {showDetails && error && process.env.NODE_ENV === 'development' && (
        <details className="mb-4 w-full max-w-md">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            รายละเอียดข้อผิดพลาด
          </summary>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto text-left">
            {error.message}
          </pre>
        </details>
      )}
      
      {resetError && (
        <Button onClick={resetError} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          ลองใหม่
        </Button>
      )}
    </div>
  )
}

// Small inline error component
export function InlineError({ 
  message = 'เกิดข้อผิดพลาด', 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex items-center justify-center p-4 text-red-600 bg-red-50 rounded-md">
      <AlertCircle className="h-4 w-4 mr-2" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="ghost" 
          size="sm" 
          className="ml-2 h-6 px-2 text-red-600 hover:text-red-700"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}