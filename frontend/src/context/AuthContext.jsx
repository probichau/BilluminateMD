/**
 * Authentication Context
 * Manages user authentication state and provides auth methods throughout the app
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to load saved auth:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  // Check subscription status when user changes
  useEffect(() => {
    if (user && token) {
      checkSubscriptionStatus()
    } else {
      setHasActiveSubscription(false)
    }
  }, [user, token])

  /**
   * Register a new user
   */
  async function register(email, password, fullName) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    // Save to state and localStorage
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    return data
  }

  /**
   * Login existing user
   */
  async function login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Save to state and localStorage
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('authToken', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    return data
  }

  /**
   * Logout user
   */
  function logout() {
    setUser(null)
    setToken(null)
    setHasActiveSubscription(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }

  /**
   * Check if user has active subscription
   */
  async function checkSubscriptionStatus() {
    try {
      const response = await fetch(`${API_URL}/api/subscription/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setHasActiveSubscription(data.hasActiveSubscription)
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    }
  }

  /**
   * Get auth headers for API requests
   */
  function getAuthHeaders() {
    if (!token) return {}
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    hasActiveSubscription,
    register,
    login,
    logout,
    checkSubscriptionStatus,
    getAuthHeaders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
