'use client'

import { useState, useEffect } from 'react'
import { format, startOfDay, addMinutes, isSameMinute } from 'date-fns'
import { Button } from '@/components/ui/button'
import BookingDetailsModal from './BookingDetailsModal'

interface Room {
  roomId: number
  roomName: string
  capacity: number
  equipment?: string
  status: string
}

interface Booking {
  bookingId: number
  roomId: number
  title: string
  startDatetime: string
  endDatetime: string
  room: Room
  bookingTitle?: string
  description?: string
  createdBy?: string
  participants?: Array<{
    participantName: string
  }>
}

interface BookingCalendarProps {
  selectedDate: Date
  onTimeSlotClick: (roomId: number, startTime: Date, endTime: Date) => void
}

export default function BookingCalendar({ selectedDate, onTimeSlotClick }: BookingCalendarProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const startHour = 8
  const endHour = 18
  const slotDuration = 30

  const timeSlots: Date[] = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      timeSlots.push(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minute))
    }
  }

  useEffect(() => {
    fetchRoomsAndBookings()
    const interval = setInterval(fetchRoomsAndBookings, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const fetchRoomsAndBookings = async () => {
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

  const isSlotBooked = (roomId: number, slotTime: Date) => {
    return bookings.some(booking => {
      if (booking.roomId !== roomId) return false
      const bookingStart = new Date(booking.startDatetime)
      const bookingEnd = new Date(booking.endDatetime)
      return slotTime >= bookingStart && slotTime < bookingEnd
    })
  }

  const getBookingForSlot = (roomId: number, slotTime: Date) => {
    return bookings.find(booking => {
      if (booking.roomId !== roomId) return false
      const bookingStart = new Date(booking.startDatetime)
      const bookingEnd = new Date(booking.endDatetime)
      return slotTime >= bookingStart && slotTime < bookingEnd
    })
  }

  const handleSlotClick = async (roomId: number, slotTime: Date) => {
    const booking = getBookingForSlot(roomId, slotTime)
    
    if (booking) {
      // คลิกที่ช่วงเวลาที่มีการจอง - แสดงรายละเอียด
      try {
        const response = await fetch(`/api/bookings/${booking.bookingId}`)
        if (response.ok) {
          const fullBookingData = await response.json()
          setSelectedBooking(fullBookingData)
          setShowDetailsModal(true)
        }
      } catch (error) {
        console.error('Error fetching booking details:', error)
      }
    } else {
      // คลิกที่ช่วงเวลาว่าง - สร้างการจองใหม่
      const endTime = addMinutes(slotTime, slotDuration)
      onTimeSlotClick(roomId, slotTime, endTime)
    }
  }

  const handleBookingUpdate = () => {
    fetchRoomsAndBookings()
    setShowDetailsModal(false)
    setSelectedBooking(null)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-1">
            <div className="sticky left-0 bg-background border-r">
              <div className="h-12 flex items-center justify-center font-semibold border-b">
                Time
              </div>
              {timeSlots.map((slot, index) => (
                <div key={index} className="h-12 flex items-center justify-center text-sm border-b">
                  {format(slot, 'HH:mm')}
                </div>
              ))}
            </div>

            {rooms.map((room) => (
              <div key={room.roomId} className="min-w-[200px]">
                <div className="h-12 p-2 border-b bg-muted">
                  <div className="font-semibold text-sm">{room.roomName}</div>
                  <div className="text-xs text-muted-foreground">Capacity: {room.capacity}</div>
                </div>

                {timeSlots.map((slot, slotIndex) => {
                  const isBooked = isSlotBooked(room.roomId, slot)
                  const booking = getBookingForSlot(room.roomId, slot)
                  const isBookingStart = booking && isSameMinute(new Date(booking.startDatetime), slot)

                  return (
                    <div
                      key={slotIndex}
                      className={`h-12 border-b border-r cursor-pointer transition-colors ${
                        isBooked
                          ? 'bg-red-100 hover:bg-red-200'
                          : 'bg-green-50 hover:bg-green-100'
                      }`}
                      onClick={() => handleSlotClick(room.roomId, slot)}
                      title={isBooked ? 'คลิกเพื่อดูรายละเอียดการจอง' : 'คลิกเพื่อจองห้องประชุม'}
                    >
                      {isBookingStart && booking && (
                        <div className="p-1 text-xs bg-red-500 text-white rounded m-1 hover:bg-red-600">
                          <div className="font-semibold truncate">{booking.title}</div>
                          <div className="opacity-90">
                            {format(new Date(booking.startDatetime), 'HH:mm')} - 
                            {format(new Date(booking.endDatetime), 'HH:mm')}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking ? {
          bookingId: selectedBooking.bookingId,
          bookingTitle: selectedBooking.bookingTitle || selectedBooking.title,
          startTime: selectedBooking.startDatetime,
          endTime: selectedBooking.endDatetime,
          description: selectedBooking.description,
          createdBy: selectedBooking.createdBy || 'ไม่ระบุ',
          participants: selectedBooking.participants || [],
          room: {
            roomId: selectedBooking.room.roomId,
            roomName: selectedBooking.room.roomName,
            capacity: selectedBooking.room.capacity,
            equipment: selectedBooking.room.equipment ? [selectedBooking.room.equipment] : []
          }
        } : null}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedBooking(null)
        }}
        onUpdate={handleBookingUpdate}
      />
    </>
  )
}