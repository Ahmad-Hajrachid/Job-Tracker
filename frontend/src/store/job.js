import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:'jobs',
    initialState:{
        jobs:[],
        filters:{
            status:'all',
            company:''
        }
    },
    reducers:{
        addJob:(state,action) =>{
            const newJob = action.payload;
            state.jobs.push(newJob)
        },
        deleteJob: (state,action)=>{
            const jobId = action.payload;
            state.jobs = state.jobs.filter(job=>job.id !== jobId)
        }
    }
})

export const {addJob,deleteJob} = jobSlice.actions;
export default jobSlice.reducer;