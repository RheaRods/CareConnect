import api from '../lib/axios'

export interface User {
  id: number
  name: string
  email: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
}

export const userService = {
  getUsers: () => api.get<User[]>('/users'),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  createUser: (data: CreateUserData) => api.post<User>('/users', data),
  updateUser: (id: number, data: UpdateUserData) => api.put<User>(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
}
