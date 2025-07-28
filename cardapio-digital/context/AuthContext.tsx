'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, registerUser, logoutUser } from '../lib/firebase'

interface User {
  uid: string
  email: string | null
  name: string
  role: 'admin' | 'kitchen'
  restaurantId: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role?: string, restaurantId?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser() as User | null
      setUser(currentUser)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    }
    setLoading(false)
  }

  const login = async (email: string, password: string) => {
    try {
      const userData = await loginUser(email, password) as User
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const register = async (email: string, password: string, name: string, role: string = 'kitchen', restaurantId?: string) => {
    try {
      const userData = await registerUser(email, password, name, role, restaurantId) as User
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
      setUser(null)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}