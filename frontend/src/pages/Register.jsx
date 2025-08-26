import React, { useState } from 'react'
import { auth, db } from '../components/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import toast, { LoaderIcon } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import {UserPlus} from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
const Register = () => {
    const [userName,setUserName] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [isloading,setIsLoading] = useState(false)
    const navigate = useNavigate()
    const handleRegister = async(e)=>{
        e.preventDefault();
        
        try {
            setIsLoading(true)
            const userCredintials = await createUserWithEmailAndPassword(auth,email,password);  
            const user = userCredintials.user; 

            await updateProfile(user,{
                displayName:userName,
                role:'user'
            })
            await setDoc(doc(db,"Users",user.uid),{
                uid:user.uid,
                userName,
                email,
                role:'user'
            });
            
            toast.success("Registration Successful!")
            setIsLoading(false)
            navigate('/Login')
        } catch (error) {
            toast.error('Registration Failed')
            console.error("Error in registration: ",error)
            setIsLoading(false)
        }
    }
  return (
    <div className=' flex flex-col h-screen justify-center items-center '>
        <form className='card w-full max-w-md mx-auto bg-white shadow-2xl border-0 overflow-hidden' onSubmit={handleRegister}>
            {/* Header section */}
        <div className='flex flex-row w-full justify-center items-center bg-white pt-6 pb-6 px-8 rounded-t-lg relative'>
          <Link className='absolute left-8 text-black border border-black rounded-full p-1 hover:scale-105' to={'/'}><ArrowLeft className='size-8' /></Link>
          
            <h1 className='card-title text-2xl text-primary-content font-bold tracking-wide'>Register</h1>
        </div>
        <div className='divider'></div>
            {/* form content */}
            <div className='card-body space-y-4'>
            <input className='input text-primary-content bg-slate-200 input-bordered w-full transition-all duration-200  focus:bg-base/100' type="text" placeholder='Username' onChange={(e)=>setUserName(e.target.value)}/>
            <input className='input text-primary-content bg-slate-200 input-bordered w-full transition-all duration-200  focus:bg-base/100' type="email" placeholder='Email' onChange={(e)=>setEmail(e.target.value)}/>
            <input className='input text-primary-content bg-slate-200 input-bordered w-full transition-all duration-200  focus:bg-base/100' type="password" placeholder='Password' onChange={(e)=>setPassword(e.target.value)}/>
            {/* form actions */}
            <div className='card-actions flex-col p-4'>
                <button className='btn  w-full text-lg font-bold hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl' type='submit'>{isloading?<LoaderIcon className='rotating'/>:"Register"}</button>
                <div className='divider text-sm'>or</div>
                <div className=' flex flex-col items-center justify-end w-full'>
                <span className='text-base-content/70 text-sm'>Already have an account? </span>
                <Link className='link  font-medium hover:link-hover' to={'/login'}>
                    Sign in here
                </Link>
            </div>
            </div>
            </div>
            
        </form>
    </div>
  )
}

export default Register