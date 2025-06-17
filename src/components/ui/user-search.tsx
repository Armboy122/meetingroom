'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { User, Search } from 'lucide-react'

interface User {
  userId: string
  employeeId: string
  fullName: string
  position?: string
  department?: string
}

interface UserSearchProps {
  label?: string
  placeholder?: string
  value?: User | null
  onChange: (user: User | null) => void
  required?: boolean
  disabled?: boolean
}

export function UserSearch({
  label = 'ค้นหาผู้ใช้',
  placeholder = 'พิมพ์รหัสพนักงานหรือชื่อ',
  value,
  onChange,
  required = false,
  disabled = false
}: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update input when value changes externally
  useEffect(() => {
    if (value) {
      setQuery(`${value.employeeId} - ${value.fullName}`)
    } else {
      setQuery('')
    }
  }, [value])

  // Search users when query changes
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim() || query.includes(' - ')) {
      setUsers([])
      setIsOpen(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&limit=10`)
        if (response.ok) {
          const searchResults = await response.json()
          setUsers(searchResults)
          setIsOpen(searchResults.length > 0)
        }
      } catch (error) {
        console.error('Error searching users:', error)
        setUsers([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    
    // Clear selection if user is typing
    if (value && !newQuery.includes(' - ')) {
      onChange(null)
    }
  }

  const handleUserSelect = (user: User) => {
    setQuery(`${user.employeeId} - ${user.fullName}`)
    setUsers([])
    setIsOpen(false)
    onChange(user)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    if (users.length > 0) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="space-y-2">
        <Label htmlFor="user-search">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="user-search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="pl-10"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && users.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleUserSelect(user)}
              >
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-blue-600">
                      {user.employeeId}
                    </span>
                    <span className="font-medium text-gray-900">
                      {user.fullName}
                    </span>
                  </div>
                  {(user.position || user.department) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {user.position && <span>{user.position}</span>}
                      {user.position && user.department && <span> • </span>}
                      {user.department && <span>{user.department}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}