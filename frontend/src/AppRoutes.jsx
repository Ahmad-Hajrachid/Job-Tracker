import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './components/AuthProvider'
import { LoaderCircleIcon } from 'lucide-react'
import Register from './pages/register'
import Home from './pages/Home'
import Login from './pages/login'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import DashBoard from './pages/DashBoard'
import NotFound from './pages/NotFound'
import { getUserRole } from './components/crud'

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [role,setRole] = useState(null)

  useEffect(()=>{
    const fetchRole = async ()=>{
      if(user){
        const r= await getUserRole(user.uid);
        setRole(r);
      }
    }
    fetchRole()
  },[user])
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <LoaderCircleIcon className='animate-spin' size={48} />
    </div>
  );

  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/dashboard' element={role=='admin'?<DashBoard/>:<Profile/>}/>
        <Route path='/dashboard' element={user?<Profile/>:<Login/>}/>
        <Route path={`/profile/:id`} element={user?<Profile/>:<Login/>}/>
        <Route path={`/profile/`} element={user?<Profile/>:<Login/>}/>
      </Route>
      <Route path='/login' element={user?<Profile/>:<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='*' element={<NotFound/>}/>
    </Routes>
  )
}

export default AppRoutes