import { useState, useEffect, useCallback } from 'react'
import { User, Department, Division, LoadingState } from '@/types'

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const data = await response.json()
      setUsers(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    ...loadingState,
    refetch: fetchUsers,
  }
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchDepartments = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      const response = await fetch('/api/departments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments')
      }
      
      const data = await response.json()
      setDepartments(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching departments:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return {
    departments,
    ...loadingState,
    refetch: fetchDepartments,
  }
}

export const useDivisions = () => {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  const fetchDivisions = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      const response = await fetch('/api/divisions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch divisions')
      }
      
      const data = await response.json()
      setDivisions(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error('Error fetching divisions:', error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [])

  useEffect(() => {
    fetchDivisions()
  }, [fetchDivisions])

  return {
    divisions,
    ...loadingState,
    refetch: fetchDivisions,
  }
}