import { Link } from 'react-router-dom';
import React from 'react';

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-white">Job Tracker</h1>
          <p className="py-6 text-lg">
            Keep track of your job applications in one place. Organize and update 
            your application status from <span className="badge badge-info">Applied</span> to 
            <span className="badge badge-warning mx-1">Interviewed</span> or 
            <span className="badge badge-error">Rejected</span> or 
            <span className="badge badge-success">Hired</span>.
          </p>
          
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-sm">Learning Project Features:</h2>
              <div className="text-left text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Add job applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Track application status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Update progress easily</span>
                </div>
              </div>
            </div>
          </div>

          <Link to={'/profile'} className="btn bg-white text-black hover:bg-white hover:scale-[1.05] transition-all duration-200 shadow-lg hover:shadow-xl btn-lg">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}