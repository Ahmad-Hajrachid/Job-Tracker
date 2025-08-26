import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='h-screen flex flex-col justify-center items-center'>
        <div className='card bg-red-600 w-6/12 h-3/6 flex flex-col gap-2 justify-center items-center'>
            <h1 className='card-title sm:text-lg md:text-4xl lg:text-6xl font-bold text-black mb-5 text-center'>Error 404 Page Not Found</h1>
            <Link to={'/'} className='btn  bg-black text-white hover:bg-stone-800 hover:scale-105  transition-all duration-200'>Back Home</Link>
        </div>
    </div>
  )
}

export default NotFound