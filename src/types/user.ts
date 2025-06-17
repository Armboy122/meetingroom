export interface User {
  userId: string
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
  department?: Department
  division?: Division
}

export interface Department {
  departmentId: string
  departmentName: string
  divisionId: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
  division?: Division
}

export interface Division {
  divisionId: string
  divisionName: string
  status?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface UserFormData {
  employeeId: string
  fullName: string
  departmentId: string
  divisionId: string
  email?: string
}

export interface DepartmentFormData {
  departmentName: string
  divisionId: string
}

export interface DivisionFormData {
  divisionName: string
}