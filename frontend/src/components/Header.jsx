import React, { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import toast from 'react-hot-toast'
import { LogOut, Waypoints, Menu, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

const Header = () => {
  const { user, role, loading } = useAuth(); // get role from context
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged Out successfully')
      navigate('/')
      setIsMenuOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  if (loading) return null; // or a loader

  return (
    <header className='sticky top-0 bg-white text-black font-serif font-bold shadow-sm z-50'>
      {/* Desktop Header */}
      <div className='hidden md:flex flex-row justify-between items-center p-4'>
        <div>
          <Link className='ml-4 flex flex-row gap-1 justify-center items-center' to={'/'}>
            <span><Waypoints className='size-8'/></span>Job Tracker
          </Link>
        </div>
        
        <nav>
          <ul>
            {user && role === 'admin' && ( // only show if admin
              <li>
                <Link 
                  className='py-1 relative transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full'
                  to={'/dashboard'}
                >
                  Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className='flex flex-row justify-center items-center gap-2'>
          {user ? (
            <>
              <Link 
                className='relative transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full' 
                to={`/profile/${user.uid}`}
              >
                Profile
              </Link>
              <button 
                className='btn btn-error font-bold w-fit'
                onClick={handleLogout}
              >
                <LogOut/>
              </button>
            </>
          ) : (
            <>
              <Link 
                className='py-1 relative transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full' 
                to={'/login'}
              >
                Login
              </Link>
              <Link 
                className='py-1 relative transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full' 
                to={'/register'}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className='md:hidden flex flex-row justify-between items-center p-4'>
        <div>
          <Link className='flex flex-row gap-1 justify-center items-center' to={'/'}>
            <span><Waypoints className='size-8'/></span>Job Tracker
          </Link>
        </div>
        
        <button 
          onClick={toggleMenu}
          className='p-1 hover:bg-gray-100 rounded transition-colors duration-200'
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className='size-6'/> : <Menu className='size-6'/>}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className='md:hidden bg-white border-t border-gray-200 shadow-lg'>
          <nav className='p-4 space-y-4'>
            {user ? (
              <>
                {role === 'admin' && ( // only show if admin
                  <Link 
                    className='block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200'
                    to={'/dashboard'}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                )}
                <Link 
                  className='block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200'
                  to={`/profile/${user.uid}`}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button 
                  className='flex items-center gap-2 py-2 px-3 text-red-600 hover:bg-red-50 rounded transition-colors duration-200 w-full text-left'
                  onClick={handleLogout}
                >
                  <LogOut className='size-4'/>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  className='block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200'
                  to={'/login'}
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  className='block py-2 px-3 hover:bg-gray-100 rounded transition-colors duration-200'
                  to={'/register'}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
