import { useState, useCallback, useEffect } from 'react'
import { LoadingState } from '@/types'

interface CRUDHookOptions<T> {
  endpoint: string
  entityName: string
  initialData?: T[]
}

export function useAdminCRUD<T extends { [key: string]: any }>({
  endpoint,
  entityName,
  initialData = []
}: CRUDHookOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    loading: true,
    error: null
  })

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setLoadingState({ loading: true, error: null })
      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityName}`)
      }
      
      const data = await response.json()
      setItems(data)
      setLoadingState({ loading: false, error: null })
    } catch (error) {
      console.error(`Error fetching ${entityName}:`, error)
      setLoadingState({
        loading: false,
        error: error instanceof Error ? error.message : `Failed to fetch ${entityName}`
      })
    }
  }, [endpoint, entityName])

  // Create item
  const createItem = useCallback(async (itemData: Partial<T>) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create ${entityName}`)
      }

      const newItem = await response.json()
      setItems(prev => [...prev, newItem])
      return newItem
    } catch (error) {
      console.error(`Error creating ${entityName}:`, error)
      throw error
    }
  }, [endpoint, entityName])

  // Update item
  const updateItem = useCallback(async (id: string | number, itemData: Partial<T>) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update ${entityName}`)
      }

      const updatedItem = await response.json()
      setItems(prev => prev.map(item => 
        (item.id || item[Object.keys(item)[0]]) === id ? updatedItem : item
      ))
      return updatedItem
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error)
      throw error
    }
  }, [endpoint, entityName])

  // Delete item
  const deleteItem = useCallback(async (id: string | number) => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete ${entityName}`)
      }

      setItems(prev => prev.filter(item => 
        (item.id || item[Object.keys(item)[0]]) !== id
      ))
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error)
      throw error
    }
  }, [endpoint, entityName])

  // Initial fetch
  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    ...loadingState,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}