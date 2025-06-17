'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/loading'
import { InlineError } from '@/components/error'
import { useRooms } from '@/hooks/useRooms'
import { Plus, Edit, Trash2, Monitor } from 'lucide-react'
import { Room } from '@/types'

interface RoomFormData {
  roomName: string
  capacity: number
  equipment: string
}

export function RoomSection() {
  const { rooms, loading, error, createRoom, updateRoom, deleteRoom, refetch } = useRooms()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState<RoomFormData>({
    roomName: '',
    capacity: 10,
    equipment: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room)
      setFormData({
        roomName: room.roomName,
        capacity: room.capacity,
        equipment: room.equipment || ''
      })
    } else {
      setEditingRoom(null)
      setFormData({
        roomName: '',
        capacity: 10,
        equipment: ''
      })
    }
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRoom(null)
    setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.roomId, formData)
      } else {
        await createRoom({ ...formData, status: 'active' })
      }
      closeModal()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (room: Room) => {
    if (window.confirm(`ต้องการลบห้อง "${room.roomName}" หรือไม่?`)) {
      try {
        await deleteRoom(room.roomId)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบ')
      }
    }
  }

  if (loading) {
    return <LoadingState message="กำลังโหลดข้อมูลห้องประชุม..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการห้องประชุม</h2>
          <p className="text-gray-600">เพิ่ม แก้ไข หรือลบห้องประชุม</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มห้องใหม่
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <InlineError message={error} onRetry={refetch} />
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room.roomId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{room.roomName}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal(room)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(room)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ความจุ:</span>
                  <span className="font-medium">{room.capacity} คน</span>
                </div>
                {room.equipment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">อุปกรณ์:</span>
                    <span className="font-medium text-right">{room.equipment}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">สถานะ:</span>
                  <span className={`font-medium ${room.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {room.status === 'active' ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {rooms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีห้องประชุม</h3>
            <p className="text-gray-600 mb-4">เริ่มต้นโดยการเพิ่มห้องประชุมแรก</p>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มห้องใหม่
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
                {editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
              </CardTitle>
              <CardDescription>
                {editingRoom ? 'แก้ไขข้อมูลห้องประชุม' : 'กรอกข้อมูลห้องประชุมใหม่'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">ชื่อห้อง *</Label>
                  <Input
                    id="roomName"
                    value={formData.roomName}
                    onChange={(e) => setFormData(prev => ({ ...prev, roomName: e.target.value }))}
                    placeholder="เช่น ห้องประชุมใหญ่"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">ความจุ (คน) *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">อุปกรณ์</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                    placeholder="เช่น โปรเจคเตอร์, ไมโครโฟน"
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
                    {submitting ? 'กำลังบันทึก...' : (editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง')}
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