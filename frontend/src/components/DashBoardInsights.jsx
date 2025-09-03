import React ,{useState} from 'react'
import useChat from '../Hooks/useChat'
// takes the stats (count of the applied, interviewed, rejected, and hired)
// send them to ai
// the ai will give a basic summary 
// dislpay the summary on top of the dashboard
const DashBoardInsights = () => {
  
  return (
    <div><MarkdownRenderer content={messages.filter(messages.role="system")} /></div>
  )
}

export default DashBoardInsights