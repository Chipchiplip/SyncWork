import { Outlet, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import ConfirmModal from './common/ConfirmModal'

function Layout() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <div>
      <nav className="h-12 px-4 bg-black/45 backdrop-blur-sm flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer text-white/90 font-bold text-lg hover:text-white transition-colors"
          >
            <span className="text-xl">📊</span>
            Task Manager
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-white/20 border-none rounded text-white px-3 py-1.5 cursor-pointer font-medium text-sm hover:bg-white/30 transition-colors"
          >
            Boards
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 rounded-full hover:bg-white/20 p-1 pr-2 transition-colors">
                <div className="flex items-center gap-2 text-white">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-sm hidden sm:block">{user.name}</span>
                </div>
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => navigate('/profile')}
                          className={`${active ? 'bg-primary text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-red-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          )}
        </div>
      </nav>
      <main className="pt-12 h-screen">
        <Outlet />
      </main>
      <ConfirmModal />
    </div>
  )
}

export default Layout

