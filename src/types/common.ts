export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  details?: any
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeFilter {
  startDate?: string
  endDate?: string
  date?: string
}

export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface FormValidationError {
  field: string
  message: string
}

export interface ModalProps {
  open: boolean
  onClose: () => void
}

export interface TimeSlot {
  hour: number
  minute: number
  displayTime: string
  datetime: Date
}

export type ViewMode = 'calendar' | 'grid'

export interface CalendarProps {
  selectedDate: Date
  onTimeSlotClick: (roomId: number, startTime: Date, endTime: Date) => void
}

export interface AdminSettings {
  settingId: string
  settingKey: string
  settingValue: string
  updatedAt: Date
}