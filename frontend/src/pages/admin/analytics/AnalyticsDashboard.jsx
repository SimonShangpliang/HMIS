import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaVirus, 
  FaPills, 
  FaChartLine, 
  FaBed, 
  FaUserMd, 
  FaComment, 
  FaStar,
  FaArrowRight
} from "react-icons/fa";
import axios from 'axios';

const AnalyticsDashboard = () => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    averageRating: 0,
    isLoading: true
  });

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, these would be API calls to our backend functions
        // const patientsRes = await axios.get('/api/analytics/total-patients');
        // const revenueRes = await axios.get('/api/analytics/total-revenue');
        // const ratingRes = await axios.get('/api/analytics/average-satisfaction');
        
        // Simulated response for demonstration
        setTimeout(() => {
          setDashboardData({
            totalPatients: 2854,
            totalRevenue: 3240000, // ₹32.4L
            averageRating: 4.2,
            isLoading: false
          });
        }, 500);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(prev => ({...prev, isLoading: false}));
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency value
  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${value.toLocaleString()}`;
  };

  // Function to get current date and time
  const getCurrentDate = () => {
    const now = new Date();
    
    // Get day name
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day = dayNames[now.getDay()];
    
    // Get month name
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[now.getMonth()];
    
    // Get date and year
    const date = now.getDate();
    const year = now.getFullYear();
    
    // Get hours and minutes for time
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    
    return `${day}, ${month} ${date}, ${year}, ${formattedHours}:${minutes} ${ampm} IST`;
  };

  // Data for analytics cards
  const analyticsModules = [
    {
      title: "Illness Trends",
      description: "Monitor disease patterns and outbreak tracking",
      icon: <FaVirus className="text-red-500" />,
      path: "/admin/analytics/illness-trends",
      color: "bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200",
      borderColor: "border-red-200",
    },
    {
      title: "Medicine Trends",
      description: "Track medication usage and inventory patterns",
      icon: <FaPills className="text-green-500" />,
      path: "/admin/analytics/medicine-trends",
      color: "bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200",
      borderColor: "border-green-200",
    },
    {
      title: "Financial Trends",
      description: "Analyze revenue, expenses and billing patterns",
      icon: <FaChartLine className="text-blue-500" />,
      path: "/admin/analytics/financial-trends",
      color: "bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200",
      borderColor: "border-blue-200",
    },
    {
      title: "Bed Occupancy",
      description: "Monitor room and bed utilization rates",
      icon: <FaBed className="text-indigo-500" />,
      path: "/admin/analytics/bed-occupancy-trends",
      color: "bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200",
      borderColor: "border-indigo-200",
    },
    {
      title: "Doctor Workload",
      description: "Analyze physician schedules and patient loads",
      icon: <FaUserMd className="text-purple-500" />,
      path: "/admin/analytics/doctor-working-trends",
      color: "bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200",
      borderColor: "border-purple-200",
    },
    {
      title: "Feedback Analysis",
      description: "AI-powered text analysis of patient comments",
      icon: <FaComment className="text-amber-500" />,
      path: "/admin/analytics/text-feedback",
      color: "bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200",
      borderColor: "border-amber-200",
    },
    {
      title: "Rating Metrics",
      description: "Track and analyze patient satisfaction ratings",
      icon: <FaStar className="text-yellow-500" />,
      path: "/admin/analytics/feedbacks",
      color: "bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200",
      borderColor: "border-yellow-200",
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive insights and trends for Hospital Management
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Total Patients</h3>
              {dashboardData.isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{dashboardData.totalPatients.toLocaleString()}</p>
              )}
              <span className="text-green-500 text-sm font-medium">↑ 12.5%</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Revenue (April 2025)</h3>
              {dashboardData.isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(dashboardData.totalRevenue)}</p>
              )}
              <span className="text-green-500 text-sm font-medium">↑ 8.3%</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm">Patient Satisfaction</h3>
              {dashboardData.isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-800">{dashboardData.averageRating}/5.0</p>
              )}
              <span className="text-yellow-500 text-sm font-medium">↓ 0.3</span>
              <span className="text-gray-400 text-sm"> from last month</span>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsModules.map((module, index) => (
          <Link 
            key={index} 
            to={module.path}
            className={`relative ${module.color} p-6 rounded-lg shadow-sm border ${module.borderColor} transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]`}
          >
            <div className="flex items-start mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                {module.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{module.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{module.description}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {/* <span className="text-sm font-medium text-gray-700">{module.stats}</span> */}
              <div className="text-gray-400 hover:text-gray-700 transition-colors">
                <FaArrowRight />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Date and Time */}
      <div className="mt-8 text-right text-gray-500 text-sm">
        Last updated: {getCurrentDate()}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
