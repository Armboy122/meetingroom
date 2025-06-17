import { useState, useEffect, useCallback } from 'react'
import { Room, LoadingState } from '@/types'

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchRooms = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      const response = await fetch('/api/rooms')
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms')
      }
      
      const data = await response.json()
      setRooms(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  const createRoom = useCallback(async (roomData: Omit<Room, 'roomId' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      const newRoom = await response.json()
      setRooms(prev => [...prev, newRoom])
      return newRoom
    } catch (error) {
      console.error('Error creating room:', error)
      throw error
    }
  }, [])

  const updateRoom = useCallback(async (roomId: number, roomData: Partial<Room>) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      })

      if (!response.ok) {
        throw new Error('Failed to update room')
      }

      const updatedRoom = await response.json()
      setRooms(prev => prev.map(room => 
        room.roomId === roomId ? updatedRoom : room
      ))
      return updatedRoom
    } catch (error) {
      console.error('Error updating room:', error)
      throw error
    }
  }, [])

  const deleteRoom = useCallback(async (roomId: number) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete room')
      }

      setRooms(prev => prev.filter(room => room.roomId !== roomId))
    } catch (error) {
      console.error('Error deleting room:', error)
      throw error
    }
  }, [])

  return {
    rooms,
    ...loadingState,
    refetch: fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  }
}