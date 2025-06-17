// Main exports for all types
export * from './room'
export * from './user'
export * from './booking'
export * from './common'

// Re-export specific commonly used types
export type { Room, RoomClosure } from './room'
export type { User, Department, Division } from './user'
export type { Booking, Participant, BookingStatus } from './booking'
export type { ApiResponse, LoadingState, ViewMode } from './common'