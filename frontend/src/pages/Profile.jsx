import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../components/AuthProvider'
import { LoaderCircleIcon, UserIcon, EditIcon, TrashIcon, FilterIcon, BriefcaseIcon, BotIcon } from 'lucide-react'
import { createJobApplication, deleteJobApplication, getAllJobApplications, updateJobStatus } from '../components/crud'
import { addJob, deleteJob, updateJob, setFilter, clearAllJobs } from '../store/job'
import useChat from '../Hooks/useChat'
import MarkdownRenderer from '../components/MarkdownRenderer' // Assuming this is the correct import

const Profile = () => {
  const { user, loading } = useAuth()
  const dispatch = useDispatch()
  
  // Redux state
  const { jobs, filters } = useSelector(state => state.jobs)
  
  // Local state
  const [isLoading, setIsLoading] = useState(true)
  const [editingJob, setEditingJob] = useState(null)
  const [jobData, setJobData] = useState({
    company: '',
    position: '',
    status: '',
  })
  const [aiInsight, setAiInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)

  // Get user-specific jobs for statistics (filter by user ownership)
  const userJobs = jobs.filter(job => {
    return job.uid === user?.uid || 
           job.userId === user?.uid || 
           job.user_id === user?.uid ||
           job.createdBy === user?.uid
  })

  // Initialize chat hook with dynamic system message
  const {messages, sendMessage} = useChat({
    system: {
      role: "system",
      content: `Your job is to give insights about these jobs:
${userJobs.map(job => `- Company: ${job.company}, Position: ${job.position}, Status: ${job.status}`).join('\n')}

Give the answer in a way where you tell the user a message like this: "You applied for 7 jobs this month, got 3 interviews! Data analyst roles have been the highest success rate for you." but based on the data I just gave you. 

Provide actionable insights, trends, and encouraging feedback about their job application journey. Keep it concise but informative.`
    },
    maxMessages: 20
  })

  // Function to generate AI insights
  const generateInsights = async () => {
    if (userJobs.length === 0) return
    
    setLoadingInsight(true)
    try {
      // Send a message to get insights
      await sendMessage("Please provide insights about my job applications.")
      
      // Wait a moment for the response to be processed
      setTimeout(() => {
        setLoadingInsight(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to generate insights:", error)
      setLoadingInsight(false)
    }
  }

  // Get the first AI response (excluding system message)
  const getAIInsight = () => {
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    return assistantMessages.length > 0 ? assistantMessages[0].content : null
  }

  // Filter jobs based on Redux filters and user ownership
  const filteredJobs = jobs.filter(job => {
    // First filter by user ownership
    const jobBelongsToUser = job.uid === user?.uid || 
                            job.userId === user?.uid || 
                            job.user_id === user?.uid ||
                            job.createdBy === user?.uid

    if (!jobBelongsToUser) return false

    // Then filter by status
    if (filters.status !== 'all' && job.status !== filters.status) return false
    
    // Filter by company if needed
    if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) return false
    
    return true
  })

  const handleCreateJob = async (e, jobData) => {
    if (!user || !user.uid) {
      console.error('User not authenticated')
      return
    }
    e.preventDefault()
    try {
      const jobDataWithUserId = { ...jobData, uid: user.uid }
      const createdJob = await createJobApplication(jobDataWithUserId)
      
      // Add to Redux store with the returned job data (including ID from database)
      dispatch(addJob({
        ...jobDataWithUserId,
        id: createdJob.id || Date.now().toString(), // Use DB ID or fallback
        createdAt: new Date().toISOString()
      }))
      
      setJobData({
        company: '',
        position: '',
        status: ''
      })

      // Generate new insights after creating a job
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error('Failed to create job ', error)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    if (!user || !user.uid) {
      console.error('User not authenticated')
      return
    }

    try {
      await updateJobStatus(id, newStatus)
      
      // Update Redux store
      dispatch(updateJob({
        id: id,
        updates: { status: newStatus }
      }))

      // Generate new insights after status update
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error("Failed to update status: ", error)
    }
  }

  const loadJobs = async () => {
    if (!user || !user.uid) {
      setIsLoading(false)
      return
    }

    try {
      const allJobs = await getAllJobApplications()
      console.log('All jobs from database:', allJobs)
      console.log('Current user UID:', user.uid)
      
      // Debug: Check the structure of jobs
      if (allJobs.length > 0) {
        console.log('First job structure:', allJobs[0])
        console.log('Available keys in first job:', Object.keys(allJobs[0]))
      }
      
      // Filter jobs to show only current user's applications
      const userJobsData = allJobs.filter(job => {
        return job.uid === user.uid || 
               job.userId === user.uid || 
               job.user_id === user.uid ||
               job.createdBy === user.uid
      })
      
      console.log('Filtered user jobs:', userJobsData)
      console.log('User jobs count:', userJobsData.length)
      
      // Clear existing jobs and add all user jobs to Redux
      dispatch(clearAllJobs())
      userJobsData.forEach(job => {
        dispatch(addJob({
          ...job,
          id: job.id || Date.now().toString(),
          createdAt: job.createdAt || new Date().toISOString()
        }))
      })

      // Generate insights after loading jobs
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error("Failed to load jobs: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJobs = async (jobId) => {
    if (!user || !user.uid) {
      console.error('User not authenticated')
      return
    }
    try {
      await deleteJobApplication(jobId)
      
      // Remove from Redux store
      dispatch(deleteJob(jobId))

      // Generate new insights after deleting a job
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error("Error deleting the job application ", error)
    }
  }

  const handleEditJob = (job) => {
    // Check multiple possible field names for user ID
    const jobBelongsToUser = job.uid === user.uid || 
                            job.userId === user.uid || 
                            job.user_id === user.uid ||
                            job.createdBy === user.uid
    
    if (!jobBelongsToUser) {
      console.error('Unauthorized: Cannot edit job application')
      return
    }
    
    setEditingJob(job)
    setJobData({
      company: job.company,
      position: job.position,
      status: job.status
    })
  }

  const handleUpdateJob = async (e) => {
    if (!user || !user.uid || !editingJob) {
      console.error('User not authenticated or no job selected')
      return
    }
    
    // Verify the job belongs to the current user
    const jobBelongsToUser = editingJob.uid === user.uid || 
                            editingJob.userId === user.uid || 
                            editingJob.user_id === user.uid ||
                            editingJob.createdBy === user.uid
    
    if (!jobBelongsToUser) {
      console.error('Unauthorized: Cannot update job application')
      return
    }
    
    e.preventDefault()
    try {
      await updateJobStatus(editingJob.id, jobData.status)
      
      // Update Redux store
      dispatch(updateJob({
        id: editingJob.id,
        updates: { 
          company: jobData.company,
          position: jobData.position,
          status: jobData.status 
        }
      }))
      
      setEditingJob(null)
      setJobData({
        company: '',
        position: '',
        status: ''
      })

      // Generate new insights after updating a job
      setTimeout(() => generateInsights(), 1000)
    } catch (error) {
      console.error('Failed to update job ', error)
    }
  }

  const cancelEdit = () => {
    setEditingJob(null)
    setJobData({
      company: '',
      position: '',
      status: ''
    })
  }

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilter({ filterType, value }))
  }

  useEffect(() => {
    if (user && user.uid) {
      loadJobs()
    } else if (!loading) {
      setIsLoading(false)
    }
  }, [user, loading])

  // Show loading while auth is loading
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoaderCircleIcon className='animate-spin' size={48} />
      </div>
    )
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const currentInsight = getAIInsight()

  return (
    <div className='min-h-screen py-8 '>
      <div className="bg-gray-50 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 p-4 rounded-xl">
        
        {/* AI Insights Section */}
        {userJobs.length > 0 && (
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <BotIcon size={20} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                AI Career Insights
              </h2>
              {loadingInsight && (
                <LoaderCircleIcon className="animate-spin text-blue-500" size={20} />
              )}
            </div>
            
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-blue-100">
              {currentInsight ? (
                <MarkdownRenderer content={currentInsight} />
              ) : loadingInsight ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <LoaderCircleIcon className="animate-spin" size={16} />
                  <span>Analyzing your job applications...</span>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  AI insights will appear here once your job data is analyzed.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <UserIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {user.displayName || user.email || 'User Profile'}
              </h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <BriefcaseIcon size={16} className="text-gray-500" />
                <span className="text-sm text-gray-500">
                  {userJobs.length} Job Application{userJobs.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Applications Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-500">{userJobs.filter(job => job.status === 'applied').length}</div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl font-bold text-yellow-500">{userJobs.filter(job => job.status === 'interviewed').length}</div>
            <div className="text-sm text-gray-600">Interviewed</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl font-bold text-green-500">{userJobs.filter(job => job.status === 'hired').length}</div>
            <div className="text-sm text-gray-600">Hired</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg text-center">
            <div className="text-2xl font-bold text-red-500">{userJobs.filter(job => job.status === 'rejected').length}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className='text-xl sm:text-2xl lg:text-3xl text-black font-bold'>
              My Job Applications ({filteredJobs.length})
            </h2>
            
            {/* Filter Section */}
            <div className="flex items-center gap-2">
              <FilterIcon size={20} className="text-gray-600" />
              <select 
                className='select text-primary-content bg-slate-200 border border-gray-300 text-sm sm:text-base min-w-[140px]'
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="interviewed">Interviewed</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <BriefcaseIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {userJobs.length === 0 ? 'No job applications yet' : 'No applications match the selected filter'}
              </p>
              <p className="text-gray-400 text-sm">
                {userJobs.length === 0 ? 'Create your first job application below' : 'Try selecting a different status filter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-slate-50 border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-black truncate">{job.company}</h3>
                      <p className="text-gray-700 font-medium truncate">{job.position}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <select
                        className={`select select-sm text-white text-xs font-medium px-2 py-1 rounded-full border-none ${
                          job.status === 'applied' ? 'bg-blue-500' :
                          job.status === 'interviewed' ? 'bg-yellow-500' :
                          job.status === 'rejected' ? 'bg-red-500' :
                          job.status === 'hired' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        value={job.status}
                        onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                      >
                        <option value="applied">Applied</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleEditJob(job)}
                        className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none flex-1 flex items-center gap-2"
                      >
                        <EditIcon size={14} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteJobs(job.id)}
                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none flex-1 flex items-center gap-2"
                      >
                        <TrashIcon size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Job Form Section */}
        <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
          <form 
            className='grid gap-4 sm:gap-6' 
            onSubmit={editingJob ? handleUpdateJob : (e) => handleCreateJob(e, jobData)}
          >
            <h2 className='text-xl sm:text-2xl lg:text-3xl text-black font-bold text-center'>
              {editingJob ? 'Edit Job Application' : 'Create New Job Application'}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <input 
                  className='input text-primary-content bg-slate-200 input-bordered w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-200' 
                  placeholder='Enter company name' 
                  type="text" 
                  value={jobData.company}
                  onChange={(e) => setJobData(prev => ({...prev, company: e.target.value}))} 
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Position</label>
                <input 
                  className='input text-primary-content bg-slate-200 input-bordered w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-200' 
                  placeholder='Enter position title' 
                  type="text" 
                  value={jobData.position}
                  onChange={(e) => setJobData(prev => ({...prev, position: e.target.value}))} 
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                  className='select text-primary-content bg-slate-200 w-full h-10 sm:h-12 text-sm sm:text-base border border-gray-300' 
                  name="status" 
                  value={jobData.status} 
                  onChange={(e) => setJobData(prev => ({...prev, status: e.target.value}))}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="applied">Applied</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              {editingJob && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className='btn btn-outline w-full sm:w-auto text-lg font-bold hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl' 
                >
                  Cancel
                </button>
              )}
              <button 
                className='btn w-full sm:w-auto text-lg font-bold hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl' 
                type='submit'
              >
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile