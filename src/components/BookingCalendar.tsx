'use client'

import { useState, useMemo } from 'react'
import { format, addMinutes, isSameMinute } from 'date-fns'
import { Button } from '@/components/ui/button'
import BookingDetailsModal from './BookingDetailsModal'
import { useRooms } from '@/hooks/useRooms'
import { useBookings } from '@/hooks/useBookings'
import { useRoomClosures } from '@/hooks/useRoomClosures'
import { generateTimeSlots } from '@/lib/utils/time'
import { getStatusColor, getStatusBadgeColor, getStatusText } from '@/lib/utils/booking'
import { CalendarProps, Booking } from '@/types'
import { LoadingState } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { showErrorPopup } from '@/components/ui/popup'

export default function BookingCalendar({ selectedDate, onTimeSlotClick }: CalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Use custom hooks for data fetching
  const { rooms, loading: roomsLoading } = useRooms()
  const { 
    bookings, 
    loading: bookingsLoading, 
    isSlotBooked, 
    getBookingForSlot 
  } = useBookings({ 
    date: selectedDate, 
    autoRefresh: true,
    refreshInterval: 30000 
  })
  const { 
    closures, 
    loading: closuresLoading, 
    isSlotClosed, 
    getClosureForSlot 
  } = useRoomClosures({ date: selectedDate })

  // Memoize time slots calculation
  const timeSlots = useMemo(() => {
    return generateTimeSlots(8, 18, 30, selectedDate)
  }, [selectedDate])

  const loading = roomsLoading || bookingsLoading || closuresLoading

  const handleSlotClick = async (roomId: number, slotTime: Date) => {
    const booking = getBookingForSlot(roomId, slotTime)
    const closure = getClosureForSlot(roomId, slotTime)
    
    if (closure) {
      // คลิกที่ช่วงเวลาที่ปิดห้อง - แสดงข้อความ
      showErrorPopup('ห้องถูกปิดการใช้งาน', `เหตุผล: ${closure.reason}`)
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
      const endTime = addMinutes(slotTime, 30) // 30 minutes slot duration
      onTimeSlotClick(roomId, slotTime, endTime)
    }
  }

  const handleBookingUpdate = () => {
    // Hooks will automatically refetch when needed
    setShowDetailsModal(false)
    setSelectedBooking(null)
  }

  if (loading) {
    return <LoadingState message="กำลังโหลดข้อมูลการจอง..." />
  }

  return (
    <ErrorBoundary>
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

                  // กำหนดสีและ title สำหรับช่วงเวลา
                  let slotColor = 'bg-green-50 hover:bg-green-100'
                  let slotTitle = 'คลิกเพื่อจองห้องประชุม'
                  
                  if (isClosed) {
                    slotColor = 'bg-gray-400 hover:bg-gray-500'
                    slotTitle = 'ห้องปิดการใช้งาน - คลิกเพื่อดูรายละเอียด'
                  } else if (isBooked) {
                    slotColor = getStatusColor(booking?.status as any || 'approved')
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
                        <div className={`p-1 text-xs text-white rounded m-1 ${getStatusBadgeColor(booking.status as any)}`}>
                          <div className="font-semibold truncate">{booking.title}</div>
                          <div className="opacity-90 text-[10px]">
                            {format(new Date(booking.startDatetime), 'HH:mm')} - 
                            {format(new Date(booking.endDatetime), 'HH:mm')}
                          </div>
                          <div className="opacity-90 text-[10px] font-medium">
                            {getStatusText(booking.status as any)}
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
          bookingId: parseInt(selectedBooking.bookingId) || 0,
          bookingTitle: selectedBooking.title,
          startTime: selectedBooking.startDatetime,
          endTime: selectedBooking.endDatetime,
          description: selectedBooking.description,
          createdBy: selectedBooking.createdBy || 'ไม่ระบุ',
          participants: selectedBooking.participants || [],
          room: {
            roomId: selectedBooking.room?.roomId || 0,
            roomName: selectedBooking.room?.roomName || '',
            capacity: selectedBooking.room?.capacity || 0,
            equipment: selectedBooking.room?.equipment ? [selectedBooking.room.equipment] : []
          }
        } : null}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedBooking(null)
        }}
        onUpdate={handleBookingUpdate}
      />
    </ErrorBoundary>
  )
}