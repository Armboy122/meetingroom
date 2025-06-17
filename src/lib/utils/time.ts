import { TimeSlot } from '@/types'

export const generateTimeSlots = (
  startHour = 8,
  endHour = 18,
  slotDuration = 30,
  selectedDate = new Date()
): Date[] => {
  const slots: Date[] = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      slots.push(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          hour,
          minute
        )
      )
    }
  }
  
  return slots
}

export const generateTimeSlotOptions = (
  startHour = 8,
  endHour = 18,
  slotDuration = 30
): string[] => {
  const slots: string[] = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  
  return slots
}

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`
}

export const isTimeSlotValid = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false
  
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  return end > start
}

export const combineDateAndTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`)
}