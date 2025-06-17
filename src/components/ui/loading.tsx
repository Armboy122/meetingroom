import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin text-gray-500',
        sizeClasses[size],
        className
      )} 
    />
  )
}

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({ 
  message = 'กำลังโหลด...', 
  size = 'md',
  className 
}: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <LoadingSpinner size={size} className="mb-3" />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}

// Inline loading for small components
export function InlineLoading({ 
  message = 'กำลังโหลด...',
  className 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn('flex items-center justify-center p-2 text-gray-600', className)}>
      <LoadingSpinner size="sm" className="mr-2" />
      <span className="text-sm">{message}</span>
    </div>
  )
}