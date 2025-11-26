import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'

function LoginPage() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    // Check if we have a code from Google OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')

    if (code) {
      handleGoogleCallback(code, state || undefined)
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = `${window.location.origin}/login`
      const authUrl = await authService.getGoogleAuthUrl(redirectUri)
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleGoogleCallback = async (code: string, state?: string) => {
    try {
      const response = await authService.handleGoogleCallback(code, state)
      setAuth(response.user, response.token, response.refreshToken)
      window.location.href = '/'
    } catch (error) {
      console.error('Callback error:', error)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Task Manager</h1>
        <button onClick={handleGoogleLogin} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Login with Google
        </button>
      </div>
    </div>
  )
}

export default LoginPage

