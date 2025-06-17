import { z } from 'zod'

export const userSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(20, 'Employee ID must be less than 20 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  departmentId: z.string().min(1, 'Department is required'),
  divisionId: z.string().min(1, 'Division is required'),
  email: z.string().email('Invalid email format').optional(),
})

export const departmentSchema = z.object({
  departmentName: z.string().min(1, 'Department name is required').max(100, 'Department name must be less than 100 characters'),
  divisionId: z.string().min(1, 'Division is required'),
})

export const divisionSchema = z.object({
  divisionName: z.string().min(1, 'Division name is required').max(100, 'Division name must be less than 100 characters'),
})

export type UserFormData = z.infer<typeof userSchema>
export type DepartmentFormData = z.infer<typeof departmentSchema>
export type DivisionFormData = z.infer<typeof divisionSchema>