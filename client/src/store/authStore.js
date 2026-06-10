import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: ({ user, token, isAuthenticated }) =>
    set({ user, token, isAuthenticated }),

  initializeAuth: async () => {
    set({ isLoading: true })
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session && !error) {
        set({
          user: { id: session.user.id, email: session.user.email },
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false
        })
        localStorage.setItem('docflow_token', session.access_token)
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
        localStorage.removeItem('docflow_token')
      }
    } catch (err) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const token = data.session.access_token
      localStorage.setItem('docflow_token', token)
      set({
        user: { id: data.user.id, email: data.user.email },
        token,
        isAuthenticated: true,
        isLoading: false
      })
      return { success: true }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.message }
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('docflow_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  signup: async (email, password, full_name) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.session) {
        const token = data.session.access_token
        localStorage.setItem('docflow_token', token)
        set({
          user: { id: data.user.id, email: data.user.email },
          token,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({ isLoading: false })
      }
      return { success: true, requiresVerification: !data.session }
    } catch (err) {
      set({ isLoading: false })
      return { success: false, error: err.message }
    }
  }
}))

export default useAuthStore
export { useAuthStore }
