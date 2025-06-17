import { useState, useEffect, useCallback } from 'react'
import { RoomClosure, LoadingState } from '@/types'
import { format } from 'date-fns'

interface UseRoomClosuresOptions {
  date?: Date
  roomId?: number
}

export const useRoomClosures = (options: UseRoomClosuresOptions = {}) => {
  const { date, roomId } = options
  
  const [closures, setClosures] = useState<RoomClosure[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchClosures = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      
      const params = new URLSearchParams()
      if (date) {
        params.append('date', format(date, 'yyyy-MM-dd'))
      }
      if (roomId) {
        params.append('roomId', roomId.toString())
      }
      
      const response = await fetch(`/api/room-closures?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch room closures')
      }
      
      const data = await response.json()
      setClosures(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching room closures:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [date, roomId])

  useEffect(() => {
    fetchClosures()
  }, [fetchClosures])

  const createClosure = useCallback(async (closureData: any) => {
    try {
      const response = await fetch('/api/room-closures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closureData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to create room closure')
      }

      const newClosure = await response.json()
      await fetchClosures() // Refresh closures after creation
      return newClosure
    } catch (error) {
      console.error('Error creating room closure:', error)
      throw error
    }
  }, [fetchClosures])

  const updateClosure = useCallback(async (closureId: string, closureData: any) => {
    try {
      const response = await fetch(`/api/room-closures/${closureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closureData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to update room closure')
      }

      const updatedClosure = await response.json()
      await fetchClosures() // Refresh closures after update
      return updatedClosure
    } catch (error) {
      console.error('Error updating room closure:', error)
      throw error
    }
  }, [fetchClosures])

  const deleteClosure = useCallback(async (closureId: string) => {
    try {
      const response = await fetch(`/api/room-closures/${closureId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to delete room closure')
      }

      await fetchClosures() // Refresh closures after deletion
    } catch (error) {
      console.error('Error deleting room closure:', error)
      throw error
    }
  }, [fetchClosures])

  // Helper functions for closure logic
  const isSlotClosed = useCallback((roomId: number, slotTime: Date) => {
    return closures.some(closure => {
      if (closure.roomId !== roomId) return false
      const closureStart = new Date(closure.startDatetime)
      const closureEnd = new Date(closure.endDatetime)
      return slotTime >= closureStart && slotTime < closureEnd
    })
  }, [closures])

  const getClosureForSlot = useCallback((roomId: number, slotTime: Date) => {
    return closures.find(closure => {
      if (closure.roomId !== roomId) return false
      const closureStart = new Date(closure.startDatetime)
      const closureEnd = new Date(closure.endDatetime)
      return slotTime >= closureStart && slotTime < closureEnd
    })
  }, [closures])

  return {
    closures,
    ...loadingState,
    refetch: fetchClosures,
    createClosure,
    updateClosure,
    deleteClosure,
    isSlotClosed,
    getClosureForSlot,
  }
}