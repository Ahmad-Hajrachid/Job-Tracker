import React,{useEffect, useState} from 'react'
import useChat from '../Hooks/useChat'
import ChatMessage from './ChatMessage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import MarkdownRenderer from './MarkDownRenderer';
import { Bot, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
// user pastes a job description
// ai returns:
// 1- Key required Skills:
// 2- Recommended keywords
// 3- Suitability rating (%0-%100)
// Display results in a list, chart or table

const JobAnalyzer = () => {
  const [isVisible,setIsVisible] = useState(false);
  const {messages,sendMessage} = useChat({
    system: {
   role: "system",
   content: `You are a job description analyzer AI. Your task is to analyze job descriptions and provide structured output. Format your response exactly as follows:

SKILLS: [list the 5-8 most important technical and soft skills, separated by commas]
KEYWORDS: [list 8-12 recommended keywords for resumes/cover letters, separated by commas]
RATING: [based on what your analysis, give numerical score 0-100% based on how good the provided job description is']

After the structured data above, provide a detailed analysis explaining your findings. Be precise, analytical, and focus on actionable insights. If the user asks random questions, prompt them to only send job descriptions or their background for suitability rating make sure to make important stuff bold or highlighted.`
  },
    maxMessages:20
  })
  
  const parseAnalysis = (content) => {
  const skillsMatch = content.match(/SKILLS: (.*)/);
  const keywordsMatch = content.match(/KEYWORDS: (.*)/);
  const ratingMatch = content.match(/RATING: (.*)/);
  
    const rating = ratingMatch? parseInt(ratingMatch[1].trim()):0;

  return {
    skills: skillsMatch ? skillsMatch[1].split(', ').map(s => s.trim()) : [],
    keywords: keywordsMatch ? keywordsMatch[1].split(', ').map(k => k.trim()) : [],
    rating: rating,
    fullResponse: content
  };
};
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const handleOnKeyDown = async (e)=>{
    if(!input) return;
    setLoading(true)
    if(e.key === "Enter"){
      await sendMessage(input)
    }
    setLoading(false); 
  }
  const handleSend = async ()=>{
    if(!input){
      toast.error("Enter a Job Description!")
      return;
    }
    setLoading(true);
    await sendMessage(input);
    setLoading(false)
    setInput("")

  }

  const latestAssistantMessage = messages
  .filter(msg => msg.role==="assistant")
  .slice(-1)[0];

  const analysisData = latestAssistantMessage? parseAnalysis(latestAssistantMessage.content): null;

  const createChartData = (rating)=>{
    return [
      {name:'Match', value:rating},
      {name:'Gap',value:100-rating}
    ];
  };

  const chartData = analysisData? createChartData(analysisData.rating):[];
  const COLORS = ['#2ECC71', '#E74C3C']; //chart colors

  useEffect(()=>{
    if(analysisData){
      setIsVisible(true)
    }
  },[analysisData])

  return (
    <div className='max-w-6xl mx-auto p-6 rounded-lg shadow-lg my-5'>
    <div className='p-8 rounded-md bg-slate-200'>
      <h1 className='text-3xl font-bold text-gray-800 mb-2'>Analyize Job Description here</h1>
      <p className="text-gray-600">Enter a job description and get instant AI-powered analysis</p>
      {/* input section */}
      <div className='flex flex-col gap-4 p-6 rounded-xl'>
        <input className='w-full p-4 rounded-xl' value={input} type="text" placeholder='Enter Job Description...' onKeyDown={handleOnKeyDown} onChange={(e)=>{setInput(e.target.value)}} />
        <button className="flex gap-3 px-6 py-3 w-fit mx-auto bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400 rounded-lg transition-colors"
              disabled={loading} onClick={handleSend}>{loading?(<><Loader2 className='size-4 animate-spin'/></>):(<>Analyze <Send className='size-4'/></>)}</button>
      </div>
      {/* messages section */}
      {analysisData && (
        
        <div className={`mt-6 bg-slate-100 p-6 rounded-xl transition-all duration-500 ${isVisible? 'opacity-100 translate-y-0':'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center mb-4">
              <Bot className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">AI Analysis Results</h2>
            </div>
          <div className='w-full flex flex-col gap-2 justify-center bg-slate-50 border shadow-md rounded-xl p-4 my-3'>
            <h3 className='text-red-500 sm:text-xl md:text-2xl font-bold'>Key Required Skills:</h3>
            <ul className='grid sm:grid-cols-2 md:grid-cols-3 gap-2 '>
              {analysisData.skills.map((skill, i) => (
                <li className='text-center text-black bg-blue-100 w-full rounded-xl' key={i}> {skill}</li>
              ))}
            </ul>
          </div>
          
          <div className='w-full flex flex-col gap-2 justify-center bg-slate-50 border shadow-md rounded-xl p-4 my-3'>
            <h3 className='text-red-500 sm:text-xl md:text-2xl font-bold'>Recommended Keywords:</h3>
            <ul className='grid sm:grid-cols-2 md:grid-cols-3 gap-2 '>
              {analysisData.keywords.map((keyword, i) => (
                <li className='text-center text-black bg-blue-100 w-full rounded-xl' key={i}>{keyword}</li>
              ))}
            </ul>
          </div>
          
          <div className='w-full flex flex-col gap-2 justify-center bg-slate-50 border shadow-md rounded-xl p-4 my-3' >
            <h3 className='text-red-500 sm:text-xl md:text-2xl font-bold'>Suitability Rating:</h3>
            <ResponsiveContainer width={"100%"} height={400}>
              <PieChart>
                <Pie 
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                fill='#8884d8'
                dataKey="value"
                label={({name,value})=>`${name}: ${value}%`} >
                  {chartData.map((entry,index)=>(
                    <Cell key={`cell-${index}`} fill={COLORS[index]}/>
                  ))}

                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div  className='w-full flex flex-col gap-2 justify-center bg-slate-50 border shadow-md rounded-xl p-4 my-3' >
            <h3 className='text-red-500 sm:text-xl md:text-2xl font-bold'>Full Analysis:</h3>
            <MarkdownRenderer content={analysisData.fullResponse} />
            
          </div>
        </div>
      )}
    </div>
  
    </div>
  )
}

export default JobAnalyzer