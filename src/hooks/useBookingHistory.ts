import { useState, useCallback, useEffect } from 'react'
import { Booking, LoadingState } from '@/types'

interface BookingHistoryFilters {
  page?: number
  limit?: number
  status?: 'all' | 'pending' | 'approved' | 'rejected'
  roomId?: number
  startDate?: string
  endDate?: string
}

interface BookingHistoryResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const useBookingHistory = (initialFilters: BookingHistoryFilters = {}) => {
  const [data, setData] = useState<BookingHistoryResponse | null>(null)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })
  const [filters, setFilters] = useState<BookingHistoryFilters>({
    page: 1,
    limit: 20,
    status: 'all',
    ...initialFilters
  })

  const fetchHistory = useCallback(async (newFilters?: Partial<BookingHistoryFilters>) => {
    try {
      setLoadingState({ loading: true, error: null })
      
      const currentFilters = { ...filters, ...newFilters }
      const params = new URLSearchParams()
      
      // Add filter parameters
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const response = await fetch(`/api/bookings/history?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking history')
      }
      
      const result = await response.json()
      setData(result)
      setLoadingState({ loading: false, error: null })
      
      // Update filters state if new filters were provided
      if (newFilters) {
        setFilters(currentFilters)
      }
    } catch (error) {
      console.error('Error fetching booking history:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [filters])

  // Initial fetch
  useEffect(() => {
    fetchHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<BookingHistoryFilters>) => {
    fetchHistory(newFilters)
  }, [fetchHistory])

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    updateFilters({ page })
  }, [updateFilters])

  const nextPage = useCallback(() => {
    if (data?.pagination.hasNextPage) {
      goToPage(filters.page! + 1)
    }
  }, [data?.pagination.hasNextPage, filters.page, goToPage])

  const prevPage = useCallback(() => {
    if (data?.pagination.hasPrevPage) {
      goToPage(filters.page! - 1)
    }
  }, [data?.pagination.hasPrevPage, filters.page, goToPage])

  // Filter helpers
  const filterByStatus = useCallback((status: BookingHistoryFilters['status']) => {
    updateFilters({ status, page: 1 }) // Reset to page 1 when filtering
  }, [updateFilters])

  const filterByRoom = useCallback((roomId: number | undefined) => {
    updateFilters({ roomId, page: 1 })
  }, [updateFilters])

  const filterByDateRange = useCallback((startDate?: string, endDate?: string) => {
    updateFilters({ startDate, endDate, page: 1 })
  }, [updateFilters])

  return {
    bookings: data?.bookings || [],
    pagination: data?.pagination,
    filters,
    ...loadingState,
    refetch: fetchHistory,
    updateFilters,
    goToPage,
    nextPage,
    prevPage,
    filterByStatus,
    filterByRoom,
    filterByDateRange,
  }
}