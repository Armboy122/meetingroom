import { useState, useEffect, useCallback } from 'react'
import { Booking, LoadingState, DateRangeFilter } from '@/types'
import { format } from 'date-fns'

interface UseBookingsOptions {
  date?: Date
  roomId?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export const useBookings = (options: UseBookingsOptions = {}) => {
  const { date, roomId, autoRefresh = false, refreshInterval = 30000 } = options
  
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchBookings = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      
      const params = new URLSearchParams()
      if (date) {
        params.append('date', format(date, 'yyyy-MM-dd'))
      }
      if (roomId) {
        params.append('roomId', roomId.toString())
      }
      
      const response = await fetch(`/api/bookings?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [date, roomId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchBookings, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchBookings])

  const createBooking = useCallback(async (bookingData: any) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to create booking')
      }

      const newBooking = await response.json()
      await fetchBookings() // Refresh bookings after creation
      return newBooking
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }, [fetchBookings])

  const updateBooking = useCallback(async (bookingId: string, bookingData: Partial<Booking>) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      const updatedBooking = await response.json()
      setBookings(prev => prev.map(booking => 
        booking.bookingId === bookingId ? updatedBooking : booking
      ))
      return updatedBooking
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }, [])

  const deleteBooking = useCallback(async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      setBookings(prev => prev.filter(booking => booking.bookingId !== bookingId))
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw error
    }
  }, [])

  // Helper functions for booking logic
  const isSlotBooked = useCallback((roomId: number, slotTime: Date) => {
    return bookings.some(booking => {
      if (booking.roomId !== roomId) return false
      const bookingStart = new Date(booking.startDatetime)
      const bookingEnd = new Date(booking.endDatetime)
      return slotTime >= bookingStart && slotTime < bookingEnd
    })
  }, [bookings])

  const getBookingForSlot = useCallback((roomId: number, slotTime: Date) => {
    return bookings.find(booking => {
      if (booking.roomId !== roomId) return false
      const bookingStart = new Date(booking.startDatetime)
      const bookingEnd = new Date(booking.endDatetime)
      return slotTime >= bookingStart && slotTime < bookingEnd
    })
  }, [bookings])

  return {
    bookings,
    ...loadingState,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
    isSlotBooked,
    getBookingForSlot,
  }
}