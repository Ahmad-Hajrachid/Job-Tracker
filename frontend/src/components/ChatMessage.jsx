import React from 'react'
import MarkdownRenderer from './MarkDownRenderer';
const ChatMessage = ({role,content}) => {
  const isUser = role === 'user';
  
  return (
    <div className='h-fit'>
      <div className={`${isUser ? 'bg-red-400 p-3 self-end m-1 rounded-l':' bg-slate-100 p-4 m-1'}`}>
        <MarkdownRenderer content={content}/>
      </div>
    </div>
  )
}

export default ChatMessage