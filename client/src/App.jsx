import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import useAuthStore from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'

function App() {
  useEffect(() => {
    useAuthStore.getState().initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          localStorage.setItem('docflow_token', session.access_token)
          useAuthStore.getState().setUser({
            user: { id: session.user.id, email: session.user.email },
            token: session.access_token,
            isAuthenticated: true
          })
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('docflow_token')
          useAuthStore.getState().setUser({
            user: null,
            token: null,
            isAuthenticated: false
          })
        } else if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('docflow_token', session.access_token)
          useAuthStore.getState().setUser({
            user: { id: session.user.id, email: session.user.email },
            token: session.access_token,
            isAuthenticated: true
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:id"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  )
}

export default App
