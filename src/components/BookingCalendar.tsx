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
  status: string
  room: Room
  bookingTitle?: string
  description?: string
  createdBy?: string
  participants?: Array<{
    participantName: string
  }>
}

interface RoomClosure {
  closureId: string
  roomId: number
  startDatetime: string
  endDatetime: string
  reason: string
  createdBy: string
  room: Room
}

interface BookingCalendarProps {
  selectedDate: Date
  onTimeSlotClick: (roomId: number, startTime: Date, endTime: Date) => void
}

export default function BookingCalendar({ selectedDate, onTimeSlotClick }: BookingCalendarProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [closures, setClosures] = useState<RoomClosure[]>([])
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
      const [roomsResponse, bookingsResponse, closuresResponse] = await Promise.all([
        fetch('/api/rooms'),
        fetch(`/api/bookings?date=${format(selectedDate, 'yyyy-MM-dd')}`),
        fetch(`/api/room-closures?date=${format(selectedDate, 'yyyy-MM-dd')}`)
      ])

      const roomsData = await roomsResponse.json()
      const bookingsData = await bookingsResponse.json()
      const closuresData = await closuresResponse.json()

      setRooms(roomsData)
      setBookings(bookingsData)
      setClosures(closuresData)
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

  const isSlotClosed = (roomId: number, slotTime: Date) => {
    return closures.some(closure => {
      if (closure.roomId !== roomId) return false
      const closureStart = new Date(closure.startDatetime)
      const closureEnd = new Date(closure.endDatetime)
      return slotTime >= closureStart && slotTime < closureEnd
    })
  }

  const getClosureForSlot = (roomId: number, slotTime: Date) => {
    return closures.find(closure => {
      if (closure.roomId !== roomId) return false
      const closureStart = new Date(closure.startDatetime)
      const closureEnd = new Date(closure.endDatetime)
      return slotTime >= closureStart && slotTime < closureEnd
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
    const closure = getClosureForSlot(roomId, slotTime)
    
    if (closure) {
      // คลิกที่ช่วงเวลาที่ปิดห้อง - แสดงข้อความ
      alert(`ห้องนี้ถูกปิดการใช้งาน\nเหตุผล: ${closure.reason}`)
      return
    }
    
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
      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">สถานะการจอง:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border rounded"></div>
            <span>ว่าง</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border rounded"></div>
            <span>รอการอนุมัติ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border rounded"></div>
            <span>อนุมัติแล้ว</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 border rounded"></div>
            <span>ปิดการใช้งาน</span>
          </div>
        </div>
      </div>

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
                  const isClosed = isSlotClosed(room.roomId, slot)
                  const booking = getBookingForSlot(room.roomId, slot)
                  const closure = getClosureForSlot(room.roomId, slot)
                  const isBookingStart = booking && isSameMinute(new Date(booking.startDatetime), slot)
                  const isClosureStart = closure && isSameMinute(new Date(closure.startDatetime), slot)

                  // กำหนดสีตามสถานะการจอง
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'pending':
                        return 'bg-yellow-100 hover:bg-yellow-200'
                      case 'approved':
                        return 'bg-red-100 hover:bg-red-200'
                      case 'rejected':
                        return 'bg-gray-100 hover:bg-gray-200'
                      default:
                        return 'bg-red-100 hover:bg-red-200'
                    }
                  }

                  const getStatusBadgeColor = (status: string) => {
                    switch (status) {
                      case 'pending':
                        return 'bg-yellow-500 hover:bg-yellow-600'
                      case 'approved':
                        return 'bg-red-500 hover:bg-red-600'
                      case 'rejected':
                        return 'bg-gray-500 hover:bg-gray-600'
                      default:
                        return 'bg-red-500 hover:bg-red-600'
                    }
                  }

                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'pending':
                        return 'รอการอนุมัติ'
                      case 'approved':
                        return 'อนุมัติแล้ว'
                      case 'rejected':
                        return 'ถูกปฏิเสธ'
                      default:
                        return status
                    }
                  }

                  // กำหนดสีและ title สำหรับช่วงเวลา
                  let slotColor = 'bg-green-50 hover:bg-green-100'
                  let slotTitle = 'คลิกเพื่อจองห้องประชุม'
                  
                  if (isClosed) {
                    slotColor = 'bg-gray-400 hover:bg-gray-500'
                    slotTitle = 'ห้องปิดการใช้งาน - คลิกเพื่อดูรายละเอียด'
                  } else if (isBooked) {
                    slotColor = getStatusColor(booking?.status || 'approved')
                    slotTitle = 'คลิกเพื่อดูรายละเอียดการจอง'
                  }

                  return (
                    <div
                      key={slotIndex}
                      className={`h-12 border-b border-r cursor-pointer transition-colors ${slotColor}`}
                      onClick={() => handleSlotClick(room.roomId, slot)}
                      title={slotTitle}
                    >
                      {isClosureStart && closure && (
                        <div className="p-1 text-xs text-white rounded m-1 bg-gray-600">
                          <div className="font-semibold truncate">ปิดการใช้งาน</div>
                          <div className="opacity-90 text-[10px]">
                            {format(new Date(closure.startDatetime), 'HH:mm')} - 
                            {format(new Date(closure.endDatetime), 'HH:mm')}
                          </div>
                          <div className="opacity-90 text-[10px] font-medium truncate">
                            {closure.reason}
                          </div>
                        </div>
                      )}
                      {isBookingStart && booking && !isClosed && (
                        <div className={`p-1 text-xs text-white rounded m-1 ${getStatusBadgeColor(booking.status)}`}>
                          <div className="font-semibold truncate">{booking.title}</div>
                          <div className="opacity-90 text-[10px]">
                            {format(new Date(booking.startDatetime), 'HH:mm')} - 
                            {format(new Date(booking.endDatetime), 'HH:mm')}
                          </div>
                          <div className="opacity-90 text-[10px] font-medium">
                            {getStatusText(booking.status)}
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