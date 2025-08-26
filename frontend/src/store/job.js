// job.js - Job Slice
import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        jobs: [],
        filters: {
            status: 'all',
            company: ''
        }
    },
    reducers: {
        addJob: (state, action) => {
            const newJob = {
                id: Date.now().toString(), // Generate unique ID if not provided
                createdAt: new Date().toISOString(),
                ...action.payload
            };
            state.jobs.push(newJob);
        },
        deleteJob: (state, action) => {
            const jobId = action.payload;
            state.jobs = state.jobs.filter(job => job.id !== jobId);
        },
        updateJob: (state, action) => {
            const { id, updates } = action.payload;
            const jobIndex = state.jobs.findIndex(job => job.id === id);
            if (jobIndex !== -1) {
                state.jobs[jobIndex] = { ...state.jobs[jobIndex], ...updates };
            }
        },
        setFilter: (state, action) => {
            const { filterType, value } = action.payload;
            state.filters[filterType] = value;
        },
        clearAllJobs: (state) => {
            state.jobs = [];
        }
    }
});

export const { addJob, deleteJob, updateJob, setFilter, clearAllJobs } = jobSlice.actions;
export default jobSlice.reducer;