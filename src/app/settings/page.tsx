'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Settings, Plus, Edit, Trash2, Users, Monitor, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Room {
  roomId: number
  roomName: string
  capacity: number
  equipment: string | string[] | null
  status: string
  _count?: {
    bookings: number
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')

  const [roomForm, setRoomForm] = useState({
    roomName: '',
    capacity: '',
    equipment: '',
    adminPassword: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms()
    }
  }, [isAuthenticated])

  const handleAuth = () => {
    if (adminPassword === 'Armoff122*') {
      setIsAuthenticated(true)
      setAuthError('')
      setAdminPassword('')
    } else {
      setAuthError('รหัสผ่าน Admin ไม่ถูกต้อง')
    }
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      } else {
        setError('ไม่สามารถดึงข้อมูลห้องได้')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = () => {
    setEditingRoom(null)
    setRoomForm({
      roomName: '',
      capacity: '',
      equipment: '',
      adminPassword: ''
    })
    setShowRoomModal(true)
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setRoomForm({
      roomName: room.roomName,
      capacity: room.capacity.toString(),
      equipment: Array.isArray(room.equipment) ? room.equipment.join(', ') : (room.equipment || ''),
      adminPassword: ''
    })
    setShowRoomModal(true)
  }

  const handleSubmitRoom = async () => {
    setError('')
    setLoading(true)

    try {
      const equipmentArray = roomForm.equipment
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)

      const url = editingRoom ? `/api/rooms/${editingRoom.roomId}` : '/api/rooms'
      const method = editingRoom ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: roomForm.roomName,
          capacity: roomForm.capacity,
          equipment: equipmentArray,
          adminPassword: roomForm.adminPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowRoomModal(false)
        await fetchRooms()
        setRoomForm({
          roomName: '',
          capacity: '',
          equipment: '',
          adminPassword: ''
        })
      } else {
        setError(data.error || 'เกิดข้อผิดพลาดในการบันทึก')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (room: Room) => {
    const adminPassword = prompt('กรุณาใส่รหัสผ่าน Admin เพื่อลบห้อง:')
    
    if (adminPassword !== 'Armoff122*') {
      alert('รหัสผ่าน Admin ไม่ถูกต้อง')
      return
    }

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบห้อง "${room.roomName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/rooms/${room.roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchRooms()
        alert('ลบห้องสำเร็จ')
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการห้องประชุม</h1>
            <p className="text-gray-600 mt-2">กรุณาใส่รหัสผ่าน Admin เพื่อเข้าถึงการตั้งค่า</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="adminPassword">รหัสผ่าน Admin</Label>
              <div className="relative mt-1">
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="ใส่รหัสผ่าน Admin"
                  onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {authError && (
                <p className="text-red-500 text-sm mt-1">{authError}</p>
              )}
            </div>

            <Button 
              onClick={handleAuth}
              className="w-full"
              disabled={!adminPassword}
            >
              เข้าสู่ระบบ
            </Button>

            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main Settings Screen
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">การจัดการห้องประชุม</h1>
                <p className="text-gray-600">จัดการข้อมูลห้องประชุมทั้งหมด</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateRoom} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มห้องใหม่
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>ชื่อห้อง</TableHead>
                <TableHead>ความจุ</TableHead>
                <TableHead>อุปกรณ์</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การจองในอนาคต</TableHead>
                <TableHead>การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    กำลังโหลด...
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    ไม่มีข้อมูลห้องประชุม
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.roomId}>
                    <TableCell className="font-medium">{room.roomId}</TableCell>
                    <TableCell className="font-semibold">{room.roomName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        {room.capacity} คน
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment && 
                          (Array.isArray(room.equipment) ? room.equipment : room.equipment.split(', '))
                            .filter(eq => eq.trim())
                            .map((eq: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                            >
                              <Monitor className="w-3 h-3 mr-1" />
                              {eq.trim()}
                            </span>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        room.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.status === 'active' ? 'ใช้งานได้' : 'ปิดใช้งาน'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {room._count?.bookings || 0} รายการ
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoom(room)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          แก้ไข
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRoom(room)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          ลบ
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Room Modal */}
        <Dialog open={showRoomModal} onOpenChange={setShowRoomModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="roomName">ชื่อห้อง *</Label>
                <Input
                  id="roomName"
                  value={roomForm.roomName}
                  onChange={(e) => setRoomForm({...roomForm, roomName: e.target.value})}
                  placeholder="เช่น ห้องประชุมสยาม"
                />
              </div>

              <div>
                <Label htmlFor="capacity">ความจุ (คน) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({...roomForm, capacity: e.target.value})}
                  placeholder="เช่น 10"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="equipment">อุปกรณ์ (คั่นด้วยเครื่องหมายจุลภาค)</Label>
                <Input
                  id="equipment"
                  value={roomForm.equipment}
                  onChange={(e) => setRoomForm({...roomForm, equipment: e.target.value})}
                  placeholder="เช่น โปรเจคเตอร์, ไวท์บอร์ด, ไมโครโฟน"
                />
              </div>

              <div>
                <Label htmlFor="modalAdminPassword">รหัสผ่าน Admin *</Label>
                <Input
                  id="modalAdminPassword"
                  type="password"
                  value={roomForm.adminPassword}
                  onChange={(e) => setRoomForm({...roomForm, adminPassword: e.target.value})}
                  placeholder="ใส่รหัสผ่าน Admin"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRoomModal(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSubmitRoom}
                disabled={loading || !roomForm.roomName || !roomForm.capacity || !roomForm.adminPassword}
              >
                {loading ? 'กำลังบันทึก...' : editingRoom ? 'อัพเดต' : 'สร้าง'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 