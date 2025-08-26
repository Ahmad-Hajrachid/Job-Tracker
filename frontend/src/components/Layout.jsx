import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
const Layout = ({user}) => {
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user}/>
      <main className="flex-1">
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}

export default Layout