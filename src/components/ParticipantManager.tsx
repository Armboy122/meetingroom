'use client'

import { useState } from 'react'
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
import { X, Plus, User } from 'lucide-react'

interface Participant {
  participantName: string
  participantEmail?: string
}

interface User {
  userId: string
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
  department: string
  division: string
}

interface ParticipantManagerProps {
  participants: Participant[]
  onParticipantsChange: (participants: Participant[]) => void
  users?: User[]
}

export function ParticipantManager({ participants, onParticipantsChange, users = [] }: ParticipantManagerProps) {
  const [newParticipant, setNewParticipant] = useState<Participant>({
    participantName: '',
    participantEmail: ''
  })
  const [inputMode, setInputMode] = useState<'dropdown' | 'manual'>('dropdown')

  const addParticipant = () => {
    if (newParticipant.participantName.trim()) {
      onParticipantsChange([
        ...participants,
        {
          participantName: newParticipant.participantName.trim(),
          participantEmail: newParticipant.participantEmail?.trim() || undefined
        }
      ])
      setNewParticipant({ participantName: '', participantEmail: '' })
    }
  }

  const addParticipantFromDropdown = (userId: string) => {
    const user = users.find(u => u.userId === userId)
    if (user) {
      // Check if user is already added
      const alreadyAdded = participants.some(p => p.participantName === user.fullName)
      if (!alreadyAdded) {
        onParticipantsChange([
          ...participants,
          {
            participantName: user.fullName,
            participantEmail: user.email || undefined
          }
        ])
      }
    }
  }

  const removeParticipant = (index: number) => {
    onParticipantsChange(participants.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addParticipant()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <Label>Participants ({participants.length})</Label>
      </div>

      {participants.length > 0 && (
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <div className="font-medium">{participant.participantName}</div>
                {participant.participantEmail && (
                  <div className="text-sm text-gray-600">{participant.participantEmail}</div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeParticipant(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        {/* Mode Toggle */}
        <div className="flex space-x-2 mb-4">
          <Button
            type="button"
            variant={inputMode === 'dropdown' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('dropdown')}
          >
            เลือกจากรายชื่อ
          </Button>
          <Button
            type="button"
            variant={inputMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('manual')}
          >
            พิมพ์เอง
          </Button>
        </div>

        {inputMode === 'dropdown' ? (
          /* Dropdown Mode */
          <div className="space-y-2">
            <Label>เลือกผู้เข้าร่วมจากรายชื่อพนักงาน</Label>
            <Select onValueChange={addParticipantFromDropdown}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกพนักงาน" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(user => !participants.some(p => p.participantName === user.fullName))
                  .map((user) => (
                    <SelectItem key={user.userId} value={user.userId}>
                      {user.fullName} ({user.employeeId}) - {user.department}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Manual Input Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="participantName">ชื่อผู้เข้าร่วม</Label>
              <Input
                id="participantName"
                value={newParticipant.participantName}
                onChange={(e) => setNewParticipant(prev => ({
                  ...prev,
                  participantName: e.target.value
                }))}
                placeholder="เช่น นายสมชาย ใจดี หรือ การไฟฟ้าส่วนภูมิภาค"
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participantEmail">อีเมล (ไม่บังคับ)</Label>
              <Input
                id="participantEmail"
                type="email"
                value={newParticipant.participantEmail}
                onChange={(e) => setNewParticipant(prev => ({
                  ...prev,
                  participantEmail: e.target.value
                }))}
                placeholder="example@company.com"
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addParticipant}
                disabled={!newParticipant.participantName.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มผู้เข้าร่วม
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}