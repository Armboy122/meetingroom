import { BookingStatus } from '@/types'

export const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 hover:bg-yellow-200'
    case 'approved':
    case 'confirmed':
      return 'bg-red-100 hover:bg-red-200'
    case 'rejected':
      return 'bg-gray-100 hover:bg-gray-200'
    default:
      return 'bg-red-100 hover:bg-red-200'
  }
}

export const getStatusBadgeColor = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500 hover:bg-yellow-600'
    case 'approved':
    case 'confirmed':
      return 'bg-red-500 hover:bg-red-600'
    case 'rejected':
      return 'bg-gray-500 hover:bg-gray-600'
    default:
      return 'bg-red-500 hover:bg-red-600'
  }
}

export const getStatusText = (status: BookingStatus) => {
  switch (status) {
    case 'pending':
      return 'รอการอนุมัติ'
    case 'approved':
      return 'อนุมัติแล้ว'
    case 'confirmed':
      return 'ยืนยันแล้ว'
    case 'rejected':
      return 'ถูกปฏิเสธ'
    default:
      return status
  }
}