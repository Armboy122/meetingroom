'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, User } from 'lucide-react'

interface Participant {
  participantName: string
  participantEmail?: string
}

interface ParticipantManagerProps {
  participants: Participant[]
  onParticipantsChange: (participants: Participant[]) => void
}

export function ParticipantManager({ participants, onParticipantsChange }: ParticipantManagerProps) {
  const [newParticipant, setNewParticipant] = useState<Participant>({
    participantName: '',
    participantEmail: ''
  })

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="participantName">Name</Label>
            <Input
              id="participantName"
              value={newParticipant.participantName}
              onChange={(e) => setNewParticipant(prev => ({
                ...prev,
                participantName: e.target.value
              }))}
              placeholder="Participant name"
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participantEmail">Email (optional)</Label>
            <Input
              id="participantEmail"
              type="email"
              value={newParticipant.participantEmail}
              onChange={(e) => setNewParticipant(prev => ({
                ...prev,
                participantEmail: e.target.value
              }))}
              placeholder="participant@example.com"
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addParticipant}
          disabled={!newParticipant.participantName.trim()}
          className="mt-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Participant
        </Button>
      </div>
    </div>
  )
}