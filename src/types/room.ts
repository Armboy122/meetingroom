export interface Room {
  roomId: number
  roomName: string
  capacity: number
  equipment?: string
  status: string
  createdAt?: Date
}

export interface RoomClosure {
  closureId: string
  roomId: number
  startDatetime: string
  endDatetime: string
  reason: string
  createdBy: string
  createdAt?: Date
  updatedAt?: Date
  room?: Room
}

export interface RoomFormData {
  roomName: string
  capacity: number
  equipment?: string
}

export interface RoomClosureFormData {
  roomId: number
  startDatetime: string
  endDatetime: string
  reason: string
  createdBy: string
}