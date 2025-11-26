import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // TODO: Call logout API
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div>
      <header style={{ padding: '10px 20px', backgroundColor: '#026aa7', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Task Manager</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && (
            <>
              <span>{user.name}</span>
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

