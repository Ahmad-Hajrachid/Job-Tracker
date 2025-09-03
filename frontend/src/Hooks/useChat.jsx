import React, { useState } from 'react'
import { chat } from '../AI/Api';

export const useChat = ({system, maxMessages = 20}) => {
  const [messages, setMessages] = useState([ //messages is the conversation array
    system,
]);
    const MAX_MESSAGES = maxMessages; // Keep last 20 messages


  const sendMessage = async(text)=>{
    let newMessages = [...messages, {
        role:'user',
        content:text
    }];
    if (newMessages.length > MAX_MESSAGES) {
        newMessages = [newMessages[0], ...newMessages.slice(-MAX_MESSAGES + 1)];
    }
    setMessages(newMessages)
    try {
        const reply = await chat(newMessages)
        setMessages((currentMessages)=> [...currentMessages,{
        role:'assistant',
        content:reply
    } ])
    } catch (error) {
        console.error("Error getting a reply ",error)
    }
}
    return {messages,sendMessage}
}


export default useChat