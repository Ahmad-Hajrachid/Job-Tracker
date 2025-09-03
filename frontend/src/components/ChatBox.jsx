import { ArrowUp, Loader2Icon, MessageCircle } from 'lucide-react';
import React, { useState } from 'react'
import useChat from '../hooks/useChat';
import ChatMessage from './ChatMessage';

const ChatBox = () => {
    const {messages,sendMessage} = useChat({
        system:{
            role:"system",
            content:"You are a career counselor AI assistant. You help users analyze job descriptions, review and improve resumes, and provide career insights and job search advice. Be supportive, professional, and offer specific, actionable feedback."
        },
        maxMessages:20
    });
    const [input,setInput] = useState("");
    const [loading,setLoading] = useState(false)
    const [isChatOpened,setIsChatOpened] = useState(false)
    
    const handleSend = async ()=>{
        if(!input.trim()) return;
        setLoading(true)
        await(sendMessage(input.trim()));
        setInput("");
        setLoading(false)
    }

    const handleKeyDown = (e)=>{
        if(e.key === "Enter"){
            handleSend(); // Remove the input parameter
        }
    }

    const toggleChat = ()=>{
        setIsChatOpened(!isChatOpened)
    }
    
  return (
    <div className='fixed right-2 bottom-2 z-50'>
        {!isChatOpened && (
            <button className='rounded-full p-4 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-200 hover:scale-105' onClick={toggleChat}>
                <MessageCircle className='text-white' size={48}/>
            </button>
        )}

        {isChatOpened && (
            <div className='bg-white rounded-lg shadow-xl ms:w-[50vw] md:w-[50vw] lg:w-[30vw] ml-auto h-96 flex flex-col border border-gray-200'>
                {/* Header */}
                <div className='bg-red-500 text-white p-4 rounded-t-lg flex justify-between items-center'>
                    <h3 className='font-semibold'>AI Assistant</h3>
                    <button onClick={toggleChat} className='hover:bg-red-600 rounded px-2 py-1'>✕</button>
                </div>
                
                {/* Messages area */}
                <div className='flex-1 overflow-y-auto p-2'>
                    {messages.filter((msgArr)=>msgArr.role !== 'system')
                    .map((msg,i)=>(
                      <ChatMessage key={i} role={msg.role} content={msg.content}/>
                    ))}
                </div>
                
                {/* Input area */}
                <div className='border-t border-gray-200 p-3 bg-white rounded-b-lg'>
                    <div className='flex gap-2'>
                        <input 
                            onKeyDown={handleKeyDown} 
                            className='flex-1 h-10 px-3 text-black bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500' 
                            type="text" 
                            placeholder='Ask anything...' 
                            value={input} 
                            onChange={(e)=>setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button  
                            onClick={handleSend} 
                            disabled={loading || !input.trim()}
                            className='px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white border-none rounded-r-lg transition-colors'
                        >
                            {loading ? <Loader2Icon className='animate-spin' size={20}/> : <ArrowUp size={20}/>}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default ChatBox