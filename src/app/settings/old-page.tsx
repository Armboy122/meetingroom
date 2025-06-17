'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Plus, Edit, Trash2, Users, Monitor, Eye, EyeOff, Shield, ArrowLeft, Calendar, CheckCircle, XCircle, Clock, UserPlus, Building } from 'lucide-react'
import { format } from 'date-fns'
import DivisionModal from '@/components/admin/DivisionModal'
import DepartmentModal from '@/components/admin/DepartmentModal'
import UserModal from '@/components/admin/UserModal'
import ApprovalModal from '@/components/admin/ApprovalModal'

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

interface Division {
  divisionId: string
  divisionName: string
  departments?: Department[]
}

interface Department {
  departmentId: string
  departmentName: string
  divisionId: string
  division?: Division
}

interface User {
  userId: string
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
  status: string
  department?: Department
  division?: Division
}

interface PendingBooking {
  bookingId: string
  roomId: number
  title: string
  description?: string
  startDatetime: string
  endDatetime: string
  createdBy?: string
  createdAt: string
  room: Room
  organizer?: User
  participants?: Array<{
    participantName: string
    participantEmail?: string
  }>
}

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('rooms')
  
  // Common states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Room states
  const [rooms, setRooms] = useState<Room[]>([])
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [roomForm, setRoomForm] = useState({
    roomName: '',
    capacity: '',
    equipment: '',
    adminPassword: ''
  })

  // Division states
  const [divisions, setDivisions] = useState<Division[]>([])
  const [showDivisionModal, setShowDivisionModal] = useState(false)
  const [editingDivision, setEditingDivision] = useState<Division | null>(null)

  // Department states
  const [departments, setDepartments] = useState<Department[]>([])
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [departmentForm, setDepartmentForm] = useState({
    departmentName: '',
    divisionId: '',
    adminPassword: ''
  })

  // User states
  const [users, setUsers] = useState<User[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userForm, setUserForm] = useState({
    employeeId: '',
    fullName: '',
    departmentId: '',
    divisionId: '',
    email: '',
    adminPassword: ''
  })

  // Approval states
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null)
  const [approvalForm, setApprovalForm] = useState({
    action: '',
    reason: '',
    approvedBy: '',
    adminPassword: ''
  })

  // Memoize fetchData to avoid dependency issues
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchRooms(),
        fetchDivisions(),
        fetchDepartments(),
        fetchUsers(),
        fetchPendingBookings()
      ])
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])


  const handleAuth = async () => {
    try {
      const response = await fetch(`/api/admin/settings?password=${encodeURIComponent(adminPassword)}`)
      const data = await response.json()
      
      if (response.ok && data.isValid) {
        setIsAuthenticated(true)
        setAuthError('')
        setAdminPassword('')
      } else {
        setAuthError('รหัสผ่าน Admin ไม่ถูกต้อง')
      }
    } catch (error) {
      setAuthError('เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน')
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/divisions')
      if (response.ok) {
        const data = await response.json()
        setDivisions(data)
      }
    } catch (error) {
      console.error('Error fetching divisions:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/pending?adminPassword=${encodeURIComponent('Armoff122*')}`)
      if (response.ok) {
        const data = await response.json()
        setPendingBookings(data)
      }
    } catch (error) {
      console.error('Error fetching pending bookings:', error)
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

  // Division handlers
  const handleCreateDivision = () => {
    setEditingDivision(null)
    setShowDivisionModal(true)
  }

  const handleEditDivision = (division: Division) => {
    setEditingDivision(division)
    setShowDivisionModal(true)
  }

  const handleDeleteDivision = async (division: Division) => {
    const adminPassword = prompt('กรุณาใส่รหัสผ่าน Admin เพื่อลบกอง:')
    
    if (!adminPassword) return

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบกอง "${division.divisionName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/divisions/${division.divisionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchDivisions()
        await fetchDepartments()
        await fetchUsers()
        alert('ลบกองสำเร็จ')
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  // Department handlers
  const handleCreateDepartment = () => {
    setEditingDepartment(null)
    setDepartmentForm({
      departmentName: '',
      divisionId: '',
      adminPassword: ''
    })
    setShowDepartmentModal(true)
  }

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department)
    setDepartmentForm({
      departmentName: department.departmentName,
      divisionId: department.divisionId,
      adminPassword: ''
    })
    setShowDepartmentModal(true)
  }

  const handleDeleteDepartment = async (department: Department) => {
    const adminPassword = prompt('กรุณาใส่รหัสผ่าน Admin เพื่อลบแผนก:')
    
    if (!adminPassword) return

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบแผนก "${department.departmentName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/departments/${department.departmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchDepartments()
        await fetchUsers()
        alert('ลบแผนกสำเร็จ')
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  // User handlers
  const handleCreateUser = () => {
    setEditingUser(null)
    setUserForm({
      employeeId: '',
      fullName: '',
      departmentId: '',
      divisionId: '',
      email: '',
      adminPassword: ''
    })
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserForm({
      employeeId: user.employeeId,
      fullName: user.fullName,
      departmentId: user.departmentId,
      divisionId: user.divisionId,
      email: user.email || '',
      adminPassword: ''
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = async (user: User) => {
    const adminPassword = prompt('กรุณาใส่รหัสผ่าน Admin เพื่อลบพนักงาน:')
    
    if (!adminPassword) return

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบพนักงาน "${user.fullName}"?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchUsers()
        alert('ลบพนักงานสำเร็จ')
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการลบ')
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  // Approval handlers
  const handleApproval = async (booking: PendingBooking, action: 'approve' | 'reject') => {
    setSelectedBooking(booking)
    setApprovalForm({
      action,
      reason: '',
      approvedBy: '',
      adminPassword: ''
    })
    setShowApprovalModal(true)
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
              onClick={() => window.location.href = '/'}
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
                <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการ Admin</h1>
                <p className="text-gray-600">จัดการข้อมูลระบบห้องประชุม</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'approval', label: 'อนุมัติการจอง', icon: Calendar, count: pendingBookings.length },
                { id: 'divisions', label: 'จัดการกอง', icon: Building },
                { id: 'departments', label: 'จัดการแผนก', icon: Building },
                { id: 'users', label: 'จัดการพนักงาน', icon: UserPlus },
                { id: 'rooms', label: 'จัดการห้องประชุม', icon: Monitor }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'approval' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  การจองที่รออนุมัติ
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-8">กำลังโหลด...</div>
              ) : pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  ไม่มีการจองที่รออนุมัติ
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <div key={booking.bookingId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{booking.title}</h3>
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                            <div>
                              <p><strong>ห้อง:</strong> {booking.room.roomName}</p>
                              <p><strong>วันที่:</strong> {format(new Date(booking.startDatetime), 'dd/MM/yyyy')}</p>
                              <p><strong>เวลา:</strong> {format(new Date(booking.startDatetime), 'HH:mm')} - {format(new Date(booking.endDatetime), 'HH:mm')}</p>
                            </div>
                            <div>
                              <p><strong>ผู้จอง:</strong> {booking.organizer?.fullName || booking.createdBy}</p>
                              <p><strong>แผนก:</strong> {booking.organizer?.department?.departmentName}</p>
                              <p><strong>กอง:</strong> {booking.organizer?.division?.divisionName}</p>
                            </div>
                          </div>
                          {booking.description && (
                            <p className="mt-2 text-sm"><strong>รายละเอียด:</strong> {booking.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(booking, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            อนุมัติ
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(booking, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'divisions' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  จัดการกอง
                </h2>
                <Button onClick={handleCreateDivision} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มกองใหม่
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อกอง</TableHead>
                    <TableHead>จำนวนแผนก</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">กำลังโหลด...</TableCell>
                    </TableRow>
                  ) : divisions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">ไม่มีข้อมูลกอง</TableCell>
                    </TableRow>
                  ) : (
                    divisions.map((division) => (
                      <TableRow key={division.divisionId}>
                        <TableCell className="font-semibold">{division.divisionName}</TableCell>
                        <TableCell>{division.departments?.length || 0} แผนก</TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ใช้งาน
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditDivision(division)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              แก้ไข
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteDivision(division)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
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
          )}

          {activeTab === 'departments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  จัดการแผนก
                </h2>
                <Button onClick={handleCreateDepartment} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มแผนกใหม่
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อแผนก</TableHead>
                    <TableHead>กอง</TableHead>
                    <TableHead>จำนวนพนักงาน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">กำลังโหลด...</TableCell>
                    </TableRow>
                  ) : departments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">ไม่มีข้อมูลแผนก</TableCell>
                    </TableRow>
                  ) : (
                    departments.map((department) => (
                      <TableRow key={department.departmentId}>
                        <TableCell className="font-semibold">{department.departmentName}</TableCell>
                        <TableCell>{department.division?.divisionName}</TableCell>
                        <TableCell>{users.filter(u => u.departmentId === department.departmentId).length} คน</TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ใช้งาน
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditDepartment(department)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              แก้ไข
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteDepartment(department)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
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
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  จัดการพนักงาน
                </h2>
                <Button onClick={handleCreateUser} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มพนักงานใหม่
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสพนักงาน</TableHead>
                    <TableHead>ชื่อ-สกุล</TableHead>
                    <TableHead>แผนก</TableHead>
                    <TableHead>กอง</TableHead>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">กำลังโหลด...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">ไม่มีข้อมูลพนักงาน</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">{user.employeeId}</TableCell>
                        <TableCell className="font-semibold">{user.fullName}</TableCell>
                        <TableCell>{user.department?.departmentName}</TableCell>
                        <TableCell>{user.division?.divisionName}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              แก้ไข
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
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
          )}

          {activeTab === 'rooms' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-indigo-600" />
                  จัดการห้องประชุม
                </h2>
                <Button onClick={handleCreateRoom} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  เพิ่มห้องใหม่
                </Button>
              </div>

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
                      <TableCell colSpan={7} className="text-center py-8">กำลังโหลด...</TableCell>
                    </TableRow>
                  ) : rooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">ไม่มีข้อมูลห้องประชุม</TableCell>
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
          )}
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

        {/* Division Modal */}
        <DivisionModal
          open={showDivisionModal}
          onClose={() => setShowDivisionModal(false)}
          division={editingDivision}
          onSubmit={async (data) => {
            setError('')
            setLoading(true)
            try {
              const url = editingDivision ? `/api/divisions/${editingDivision.divisionId}` : '/api/divisions'
              const method = editingDivision ? 'PUT' : 'POST'
              
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              
              if (response.ok) {
                setShowDivisionModal(false)
                await fetchDivisions()
                await fetchDepartments()
              } else {
                const errorData = await response.json()
                setError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึก')
              }
            } catch (error) {
              setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
          error={error}
        />

        {/* Department Modal */}
        <DepartmentModal
          open={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          department={editingDepartment}
          divisions={divisions}
          onSubmit={async (data) => {
            setError('')
            setLoading(true)
            try {
              const url = editingDepartment ? `/api/departments/${editingDepartment.departmentId}` : '/api/departments'
              const method = editingDepartment ? 'PUT' : 'POST'
              
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              
              if (response.ok) {
                setShowDepartmentModal(false)
                await fetchDepartments()
                await fetchUsers()
              } else {
                const errorData = await response.json()
                setError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึก')
              }
            } catch (error) {
              setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
          error={error}
        />

        {/* User Modal */}
        <UserModal
          open={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={editingUser}
          divisions={divisions}
          departments={departments}
          onSubmit={async (data) => {
            setError('')
            setLoading(true)
            try {
              const url = editingUser ? `/api/admin/users/${editingUser.userId}` : '/api/admin/users'
              const method = editingUser ? 'PUT' : 'POST'
              
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              
              if (response.ok) {
                setShowUserModal(false)
                await fetchUsers()
              } else {
                const errorData = await response.json()
                setError(errorData.error || 'เกิดข้อผิดพลาดในการบันทึก')
              }
            } catch (error) {
              setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
          error={error}
        />

        {/* Approval Modal */}
        <ApprovalModal
          open={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          booking={selectedBooking}
          action={approvalForm.action as 'approve' | 'reject'}
          onSubmit={async (data) => {
            if (!selectedBooking) return
            
            setError('')
            setLoading(true)
            try {
              const endpoint = data.action === 'approve' ? 'approve' : 'reject'
              const response = await fetch(`/api/bookings/${selectedBooking.bookingId}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  adminPassword: data.adminPassword,
                  approvedBy: data.approvedBy,
                  rejectedBy: data.approvedBy,
                  rejectedReason: data.reason
                }),
              })
              
              if (response.ok) {
                setShowApprovalModal(false)
                await fetchPendingBookings()
                alert(`${data.action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}การจองสำเร็จ`)
              } else {
                const errorData = await response.json()
                setError(errorData.error || 'เกิดข้อผิดพลาดในการดำเนินการ')
              }
            } catch (error) {
              setError('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            } finally {
              setLoading(false)
            }
          }}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
} 