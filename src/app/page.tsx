'use client'

import { useState } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight, Calendar, Grid, Settings } from 'lucide-react'
import BookingCalendar from '@/components/BookingCalendar'
import BookingModal from '@/components/BookingModal'
import RoomGrid from '@/components/RoomGrid'

type ViewMode = 'calendar' | 'grid'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number>()
  const [selectedStartTime, setSelectedStartTime] = useState<Date>()
  const [selectedEndTime, setSelectedEndTime] = useState<Date>()

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1))
  }

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1))
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setSelectedDate(new Date(event.target.value))
    }
  }

  const handleTimeSlotClick = (roomId: number, startTime: Date, endTime: Date) => {
    setSelectedRoomId(roomId)
    setSelectedStartTime(startTime)
    setSelectedEndTime(endTime)
    setBookingModalOpen(true)
  }

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId)
    setBookingModalOpen(true)
  }

  const handleBookingCreated = () => {
    window.location.reload()
  }

  const closeBookingModal = () => {
    setBookingModalOpen(false)
    setSelectedRoomId(undefined)
    setSelectedStartTime(undefined)
    setSelectedEndTime(undefined)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              วันนี้
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="w-auto"
            />
            <h2 className="text-lg font-semibold text-gray-700">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="h-4 w-4 mr-2" />
            การตั้งค่า
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <BookingCalendar
          selectedDate={selectedDate}
          onTimeSlotClick={handleTimeSlotClick}
        />
      ) : (
        <RoomGrid
          selectedDate={selectedDate}
          onRoomSelect={handleRoomSelect}
        />
      )}

      <BookingModal
        open={bookingModalOpen}
        onClose={closeBookingModal}
        selectedRoomId={selectedRoomId}
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        onBookingCreated={handleBookingCreated}
      />
    </div>
  )
}