'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Users, Monitor } from 'lucide-react'

interface Room {
  roomId: number
  roomName: string
  capacity: number
  equipment?: string
  status: string
}

interface Booking {
  bookingId: string
  roomId: number
  title: string
  startDatetime: string
  endDatetime: string
}

interface RoomGridProps {
  selectedDate: Date
  onRoomSelect: (roomId: number) => void
}

export default function RoomGrid({ selectedDate, onRoomSelect }: RoomGridProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const fetchData = async () => {
    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/rooms'),
        fetch(`/api/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`)
      ])

      const roomsData = await roomsResponse.json()
      const bookingsData = await bookingsResponse.json()

      setRooms(roomsData)
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoomBookings = (roomId: number) => {
    return bookings.filter(booking => booking.roomId === roomId)
  }

  const getCurrentBooking = (roomId: number) => {
    const now = new Date()
    return bookings.find(booking => {
      if (booking.roomId !== roomId) return false
      const start = new Date(booking.startDatetime)
      const end = new Date(booking.endDatetime)
      return start <= now && now < end
    })
  }

  const getNextBooking = (roomId: number) => {
    const now = new Date()
    const upcomingBookings = bookings
      .filter(booking => booking.roomId === roomId && new Date(booking.startDatetime) > now)
      .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
    
    return upcomingBookings[0]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => {
        const roomBookings = getRoomBookings(room.roomId)
        const currentBooking = getCurrentBooking(room.roomId)
        const nextBooking = getNextBooking(room.roomId)
        const isOccupied = !!currentBooking

        return (
          <div
            key={room.roomId}
            className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
              isOccupied
                ? 'border-red-200 bg-red-50'
                : 'border-green-200 bg-green-50 hover:border-green-300'
            }`}
            onClick={() => onRoomSelect(room.roomId)}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {room.roomName}
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                isOccupied
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isOccupied ? 'Occupied' : 'Available'}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                Capacity: {room.capacity} people
              </div>
              {room.equipment && (
                <div className="flex items-center text-sm text-gray-600">
                  <Monitor className="h-4 w-4 mr-2" />
                  {room.equipment}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {currentBooking && (
                <div className="p-3 bg-red-100 rounded-md">
                  <div className="font-medium text-red-900">Current Meeting</div>
                  <div className="text-sm text-red-800">{currentBooking.title}</div>
                  <div className="text-xs text-red-700">
                    Until {format(new Date(currentBooking.endDatetime), 'HH:mm')}
                  </div>
                </div>
              )}

              {nextBooking && !currentBooking && (
                <div className="p-3 bg-yellow-100 rounded-md">
                  <div className="font-medium text-yellow-900">Next Meeting</div>
                  <div className="text-sm text-yellow-800">{nextBooking.title}</div>
                  <div className="text-xs text-yellow-700">
                    At {format(new Date(nextBooking.startDatetime), 'HH:mm')}
                  </div>
                </div>
              )}

              {roomBookings.length === 0 && (
                <div className="p-3 bg-green-100 rounded-md">
                  <div className="text-sm text-green-800">No meetings scheduled today</div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500">
                {roomBookings.length} meeting{roomBookings.length !== 1 ? 's' : ''} today
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                variant={isOccupied ? "outline" : "default"}
              >
                {isOccupied ? 'View Schedule' : 'Book Now'}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}