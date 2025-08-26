import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { LoaderCircleIcon, UserIcon, EditIcon, TrashIcon, FilterIcon } from 'lucide-react'
import { createJobApplication, deleteJobApplication, getAllJobApplications, updateJobStatus } from '../components/crud';

const DashBoard = () => {
  const {user,loading} = useAuth();
  const [jobs,setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isloading,setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingJob, setEditingJob] = useState(null);
  const [jobData,setJobData] = useState({
    company:'',
    position:'',
    status:'',
  })
  
  const handleCreateJob = async (e,jobData) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }
    e.preventDefault();
    try {
      const jobDataWithUserId = {...jobData, uid:user.uid}
      await createJobApplication(jobDataWithUserId);
      setJobData({
        company:'',
        position:'',
        status:''
      });
      await loadJobs()
    } catch (error) {
      console.error('Failed to create job ',error)
    }
  }

  const handleStatusUpdate = async (id,newStatus) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      await updateJobStatus(id,newStatus)
      await loadJobs(); // Reload jobs after status update
    } catch (error) {
      console.error("Failed to update status: ",error)
    }
  }

  const loadJobs = async () => {
    try {
      const jobsList = await getAllJobApplications();
      setJobs(jobsList)
      console.log(jobsList)
    } catch (error) {
      console.error("Failed to load jobs: ",error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDeleteJobs = async (jobId) => {
    if (!user || !user.uid) {
      console.error('User not authenticated');
      return;
    }
    try {
      await deleteJobApplication(jobId)
      await loadJobs(); // Reload jobs after deletion
    } catch (error) {
      console.error("Error deleting the job application ",error)
    }
  }

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobData({
      company: job.company,
      position: job.position,
      status: job.status
    });
  }

  const handleUpdateJob = async (e) => {
    if (!user || !user.uid || !editingJob) {
      console.error('User not authenticated or no job selected');
      return;
    }
    e.preventDefault();
    try {
      await updateJobStatus(editingJob.id, jobData.status);
      
      setEditingJob(null);
      setJobData({
        company:'',
        position:'',
        status:''
      });
      await loadJobs();
    } catch (error) {
      console.error('Failed to update job ', error)
    }
  }

  const cancelEdit = () => {
    setEditingJob(null);
    setJobData({
      company:'',
      position:'',
      status:''
    });
  }

  // Filter jobs based on status
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.status === filterStatus));
    }
  }, [jobs, filterStatus]);
  
  useEffect(() => {
    loadJobs()
  },[]);

  if (isloading) return (
    <div className="flex justify-center items-center min-h-screen">
      <LoaderCircleIcon className='animate-spin' size={48} />
    </div>
  );

  return (
    <div className='min-h-screen py-8'>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Job Listings Section */}
        <div className="rounded-lg bg-white p-4 sm:p-6 lg:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className='text-xl sm:text-2xl lg:text-3xl text-black font-bold'>
              Your Job Applications ({filteredJobs.length})
            </h1>
            
            {/* Filter Section */}
            <div className="flex items-center gap-2">
              <FilterIcon size={20} className="text-gray-600" />
              <select 
                className='select text-primary-content bg-slate-200 border border-gray-300 text-sm sm:text-base min-w-[140px]'
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
              <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No job applications found</p>
              <p className="text-gray-400 text-sm">Create your first job application below</p>
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
            <h1 className='text-xl sm:text-2xl lg:text-3xl text-black font-bold text-center'>
              {editingJob ? 'Edit Job Application' : 'Create Job Application'}
            </h1>
            
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

export default DashBoard