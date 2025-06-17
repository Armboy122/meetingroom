'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/loading'
import { InlineError } from '@/components/error'
import { useRooms } from '@/hooks/useRooms'
import { useRoomClosures } from '@/hooks/useRoomClosures'
import { Plus, Edit, Trash2, Ban, CalendarX } from 'lucide-react'
import { RoomClosure } from '@/types'
import { showErrorPopup, showConfirmPopup } from '@/components/ui/popup'

interface ClosureFormData {
  roomId: number
  startDatetime: string
  endDatetime: string
  reason: string
}

export function RoomClosureSection() {
  const { rooms } = useRooms()
  const { closures, loading, error, createClosure, updateClosure, deleteClosure, refetch } = useRoomClosures()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClosure, setEditingClosure] = useState<RoomClosure | null>(null)
  const [formData, setFormData] = useState<ClosureFormData>({
    roomId: 0,
    startDatetime: '',
    endDatetime: '',
    reason: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const openModal = (closure?: RoomClosure) => {
    if (closure) {
      setEditingClosure(closure)
      setFormData({
        roomId: closure.roomId,
        startDatetime: format(new Date(closure.startDatetime), 'yyyy-MM-ddTHH:mm'),
        endDatetime: format(new Date(closure.endDatetime), 'yyyy-MM-ddTHH:mm'),
        reason: closure.reason
      })
    } else {
      setEditingClosure(null)
      setFormData({
        roomId: rooms[0]?.roomId || 0,
        startDatetime: '',
        endDatetime: '',
        reason: ''
      })
    }
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingClosure(null)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      const startTime = new Date(formData.startDatetime)
      const endTime = new Date(formData.endDatetime)

      if (startTime >= endTime) {
        setFormError('เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น')
        return
      }

      const closureData = {
        roomId: formData.roomId,
        startDatetime: startTime,
        endDatetime: endTime,
        reason: formData.reason,
        createdBy: 'Admin' // TODO: Get from auth context
      }

      if (editingClosure) {
        await updateClosure(editingClosure.closureId, closureData)
      } else {
        await createClosure(closureData)
      }
      closeModal()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (closure: RoomClosure) => {
    const room = rooms.find(r => r.roomId === closure.roomId)
    showConfirmPopup(
      'ยืนยันการลบ',
      `ต้องการลบการปิดห้อง "${room?.roomName}" หรือไม่?`,
      async () => {
        try {
          await deleteClosure(closure.closureId)
        } catch (error) {
          showErrorPopup('เกิดข้อผิดพลาด', error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบ')
        }
      }
    )
  }

  if (loading) {
    return <LoadingState message="กำลังโหลดข้อมูลการปิดห้อง..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการการปิดห้อง</h2>
          <p className="text-gray-600">กำหนดช่วงเวลาที่ปิดการใช้งานห้องประชุม</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มการปิดห้องใหม่
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <InlineError message={error} onRetry={refetch} />
      )}

      {/* Closures List */}
      <div className="space-y-4">
        {closures.map((closure) => {
          const room = rooms.find(r => r.roomId === closure.roomId)
          return (
            <Card key={closure.closureId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Ban className="h-5 w-5 text-red-600" />
                    <div>
                      <CardTitle className="text-lg">{room?.roomName || 'ห้องไม่ทราบ'}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <CalendarX className="h-4 w-4" />
                        {format(new Date(closure.startDatetime), 'dd/MM/yyyy HH:mm')} - 
                        {format(new Date(closure.endDatetime), 'dd/MM/yyyy HH:mm')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal(closure)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(closure)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-gray-600">เหตุผล:</span>
                  <span className="ml-2 font-medium">{closure.reason}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {closures.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Ban className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีการปิดห้อง</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มการปิดห้องแรก</p>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มการปิดห้องใหม่
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingClosure ? 'แก้ไขการปิดห้อง' : 'เพิ่มการปิดห้องใหม่'}
              </CardTitle>
              <CardDescription>
                {editingClosure ? 'แก้ไขข้อมูลการปิดห้อง' : 'กรอกข้อมูลการปิดห้องใหม่'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomId">ห้องประชุม *</Label>
                  <select
                    id="roomId"
                    value={formData.roomId}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomId: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>เลือกห้องประชุม</option>
                    {rooms.map((room) => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDatetime">เวลาเริ่มต้น *</Label>
                  <Input
                    id="startDatetime"
                    type="datetime-local"
                    value={formData.startDatetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDatetime: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDatetime">เวลาสิ้นสุด *</Label>
                  <Input
                    id="endDatetime"
                    type="datetime-local"
                    value={formData.endDatetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDatetime: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">เหตุผล *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="เช่น บำรุงรักษา, ปรับปรุงห้อง"
                    rows={3}
                    required
                  />
                </div>

                {formError && (
                  <InlineError message={formError} />
                )}

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'กำลังบันทึก...' : (editingClosure ? 'บันทึกการแก้ไข' : 'เพิ่มการปิดห้อง')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}