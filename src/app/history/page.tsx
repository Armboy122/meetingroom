'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/ui/loading'
import { ErrorBoundary, InlineError } from '@/components/error'
import { useBookingHistory } from '@/hooks/useBookingHistory'
import { useRooms } from '@/hooks/useRooms'
import { getStatusColor, getStatusText } from '@/lib/utils/booking'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { BookingStatus } from '@/types'

export default function BookingHistoryPage() {
  const [showFilters, setShowFilters] = useState(false)
  const { rooms } = useRooms()
  
  const {
    bookings,
    pagination,
    filters,
    loading,
    error,
    refetch,
    goToPage,
    nextPage,
    prevPage,
    filterByStatus,
    filterByRoom,
    filterByDateRange,
  } = useBookingHistory()

  const handleDateFilter = (startDate: string, endDate: string) => {
    filterByDateRange(startDate || undefined, endDate || undefined)
  }

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'approved':
      case 'confirmed':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (loading && !bookings.length) {
    return <LoadingState message="กำลังโหลดประวัติการจอง..." />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ประวัติการจองห้องประชุม</h1>
            <p className="text-gray-600">ดูประวัติการจองทั้งหมด รวมถึงที่ถูกปฏิเสธ</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              ตัวกรอง
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ตัวกรองการค้นหา</CardTitle>
              <CardDescription>
                กรองผลการค้นหาตามเงื่อนไขที่ต้องการ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => filterByStatus(value as 'all' | 'pending' | 'approved' | 'rejected')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="pending">รอการอนุมัติ</SelectItem>
                      <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                      <SelectItem value="rejected">ถูกปฏิเสธ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Filter */}
                <div className="space-y-2">
                  <Label>ห้องประชุม</Label>
                  <Select
                    value={filters.roomId?.toString() || ''}
                    onValueChange={(value) => filterByRoom(value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกห้อง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ทั้งหมด</SelectItem>
                      {rooms.map((room) => (
                        <SelectItem key={room.roomId} value={room.roomId.toString()}>
                          {room.roomName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>วันที่เริ่ม</Label>
                  <Input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleDateFilter(e.target.value, filters.endDate || '')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>วันที่สิ้นสุด</Label>
                  <Input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleDateFilter(filters.startDate || '', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <InlineError message={error} onRetry={() => refetch()} />
        )}

        {/* Results Summary */}
        {pagination && (
          <div className="text-sm text-gray-600">
            แสดงผล {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalCount)} จาก {pagination.totalCount} รายการ
          </div>
        )}

        {/* Booking List */}
        <div className="space-y-4">
          {loading && bookings.length > 0 && (
            <div className="text-center py-4">
              <LoadingState message="กำลังโหลดข้อมูลใหม่..." />
            </div>
          )}
          
          {bookings.length === 0 && !loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบประวัติการจอง</h3>
                <p className="text-gray-600">ลองปรับเงื่อนไขการค้นหาใหม่</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.bookingId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.title}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {getStatusText(booking.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(booking.startDatetime), 'dd/MM/yyyy')}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(booking.startDatetime), 'HH:mm')} - 
                          {format(new Date(booking.endDatetime), 'HH:mm')}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {booking.organizer?.fullName || booking.createdBy || 'ไม่ระบุ'}
                        </div>
                        
                        {booking.participants && booking.participants.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.participants.length} คน
                          </div>
                        )}
                      </div>
                      
                      {booking.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {booking.description}
                        </p>
                      )}
                      
                      {booking.status === 'rejected' && booking.rejectedReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            <strong>เหตุผลที่ปฏิเสธ:</strong> {booking.rejectedReason}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Room Info */}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.room?.roomName}
                      </div>
                      <div className="text-sm text-gray-600">
                        ความจุ: {booking.room?.capacity} คน
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        จองเมื่อ: {format(new Date(booking.createdAt), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              หน้า {pagination.page} จาก {pagination.totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                ก่อนหน้า
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
              >
                ถัดไป
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}