import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaVirus, FaChartLine, FaCalendarAlt, FaFilter } from "react-icons/fa";
import axios from 'axios';

// Register Chart.js components
ChartJS.register(...registerables);

const IllnessTrends = () => {
  // State variables
  const [selectedDisease, setSelectedDisease] = useState("");
  const [diseases, setDiseases] = useState([]);
  const [trendStartDate, setTrendStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // Jan 1st of current year
  const [trendEndDate, setTrendEndDate] = useState(new Date());
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [error, setError] = useState(null);
  
  // States for top K diseases section
  const [topKStartDate, setTopKStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // Jan 1st of current year
  const [topKEndDate, setTopKEndDate] = useState(new Date());
  const [kValue, setKValue] = useState(5);
  const [topKData, setTopKData] = useState([]);
  const [viewType, setViewType] = useState("chart"); // 'chart' or 'cards'

  // Fetch diseases list from backend
  useEffect(() => {
    fetchDiseases();
  }, []);

  // When disease list loads, set initial selected disease
  useEffect(() => {
    if (diseases.length > 0 && !selectedDisease) {
      setSelectedDisease(diseases[0].id);
    }
  }, [diseases]);

  // Fetch disease trend data when selected disease or date range changes
  useEffect(() => {
    if (selectedDisease) {
      fetchDiseaseTrends();
    }
  }, [selectedDisease, trendStartDate, trendEndDate]);

  
  // Fetch top K diseases when parameters change
  useEffect(() => {
    if (diseases.length > 0) {
      // Ensure K value doesn't exceed the number of available diseases
      if (kValue > diseases.length) {
        setKValue(diseases.length);
      }
      fetchTopKDiseases();
    }
  }, [topKStartDate, topKEndDate, kValue, diseases.length]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/diagnosis-all`);
      console.log("Diagnoses API response:", response.data);
      
      if (!response.data || !response.data.diagnoses || !Array.isArray(response.data.diagnoses)) {
        throw new Error("Invalid diagnoses data format");
      }
      
      // Transform backend data to match frontend expectations
      const formattedDiagnoses = response.data.diagnoses.map(diagnosis => ({
        id: diagnosis._id, // Using MongoDB _id as the id
        name: diagnosis.name || "Unknown Diagnosis"
      }));
      
      console.log("Formatted diagnoses:", formattedDiagnoses);
      setDiseases(formattedDiagnoses);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      setError("Failed to load diseases. Please try again later.");
      setDiseases([]);
      setLoading(false);
    }

  };

  // Fetch disease trends data from backend
  const fetchDiseaseTrends = async () => {
    try {
      if (!selectedDisease) {
        console.warn("No disease selected");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      console.log("Fetching trends for disease ID:", selectedDisease);
      console.log("Date range:", trendStartDate.toISOString(), "to", trendEndDate.toISOString());
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/illness-trends/disease-trends`, {
        diagnosis_id: selectedDisease,
        startDate: trendStartDate.toISOString().split('T')[0],
        endDate: trendEndDate.toISOString().split('T')[0]
      });
      
      console.log("Disease trends API response:", response.data);
      
      if (!response.data) {
        throw new Error("Empty response from disease trends API");
      }
      
      // Get selected disease name
      const selectedDiseaseName = diseases.find(d => d.id === selectedDisease)?.name || 'Disease';
      
      // Process monthly data
      const monthlyLabels = response.data.monthly?.map(m => m.label) || [];
      const monthlyValues = response.data.monthly?.map(m => m.count) || [];
      
      console.log("Monthly data:", { labels: monthlyLabels, values: monthlyValues });
      
      // Process weekly data and organize by month
      const weeklyDataByMonth = {};
      if (response.data.weekly && Array.isArray(response.data.weekly)) {
        // Group weeks by month
        const weeksByMonth = {};
        
        response.data.weekly.forEach(week => {
          // Extract month from week label (e.g., "Week 1 2025")
          const parts = week.label.split(' ');
          if (parts.length < 3) return; // Skip invalid format
          
          const weekNum = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          
          // Estimate month from week number (rough approximation)
          const monthIndex = Math.floor((weekNum - 1) / 4);
          const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][monthIndex % 12];
          const monthYear = `${monthName} ${year}`;
          
          if (!weeksByMonth[monthYear]) {
            weeksByMonth[monthYear] = [];
          }
          
          weeksByMonth[monthYear].push({
            originalWeekNum: weekNum,
            count: week.count
          });
        });
        
        // Sort weeks within each month and assign relative week numbers
        Object.keys(weeksByMonth).forEach(monthYear => {
          const sortedWeeks = weeksByMonth[monthYear].sort((a, b) => a.originalWeekNum - b.originalWeekNum);
          
          weeklyDataByMonth[monthYear] = {
            labels: sortedWeeks.map((_, index) => `Week ${index + 1}`),
            values: sortedWeeks.map(week => week.count)
          };
        });
      }

      
      console.log("Weekly data by month:", weeklyDataByMonth);
      
      // Process age distribution data
      const ageDistribution = response.data.ageDistribution || {};
      const ageLabels = Object.keys(ageDistribution);
      const ageValues = Object.values(ageDistribution);
      
      console.log("Age distribution:", { labels: ageLabels, values: ageValues });
      
      setDiseaseData({
        disease: { id: selectedDisease, name: selectedDiseaseName },
        monthlyData: {
          labels: monthlyLabels,
          values: monthlyValues
        },
        weeklyDataByMonth: weeklyDataByMonth,
        ageDistribution: {
          labels: ageLabels,
          values: ageValues
        },
        totalCases: response.data.total || 0
      });
      
      setSelectedMonth(null); // Reset selected month when new data is loaded
      setActiveTab("monthly");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching disease trends:", error);
      setError(`Failed to load trend data: ${error.message}`);
      setDiseaseData(null);
      setLoading(false);
    }
  };

  // Fetch top K diseases from backend
  const fetchTopKDiseases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching top K diseases with k =", kValue);
      console.log("Date range:", topKStartDate.toISOString(), "to", topKEndDate.toISOString());
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/analytics/illness-trends/topk`, {
        startDate: topKStartDate.toISOString().split('T')[0],
        endDate: topKEndDate.toISOString().split('T')[0],
        k: kValue
      });
      
      console.log("Top K diseases API response:", response.data);
      
      if (!response.data || !response.data.topDiagnoses) {
        throw new Error("Invalid top K diseases data format");
      }
      
      // Transform backend data to match frontend expectations
      const topDiseases = response.data.topDiagnoses.map(disease => {
        // Find the disease ID from the diseases list if possible
        const matchedDisease = diseases.find(d => d.name === disease.name);
        
        return {
          id: matchedDisease ? matchedDisease.id : disease.name, // Use name as fallback ID
          name: disease.name || "Unknown",
          count: disease.count || 0,
          percentage: parseFloat(disease.percentage) || 0
        };
      });
      
      console.log("Formatted top K diseases:", topDiseases);
      setTopKData(topDiseases);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top K diseases:", error);
      setError(`Failed to load top diseases: ${error.message}`);
      setTopKData([]);
      setLoading(false);
    }
  };

  // Simulation of backend data generation for disease trends
  // This structure matches what your backend would return after processing Consultations table
  function generateDiseaseTrendData(diseaseId, startDate, endDate) {
    // Calculate date range for months
    const monthlyLabels = [];
    const monthlyValues = [];
    const monthlyData = {};
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyLabels.push(monthLabel);
      
      // Generate random value for this month (in real app, this would be from DB)
      const caseCount = Math.floor(Math.random() * 70) + 30;
      monthlyValues.push(caseCount);
      
      // Generate weekly data for this month
      const weeklyLabels = [];
      const weeklyValues = [];
      
      // Get number of weeks in the month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate();
      const weeksInMonth = Math.ceil(lastDay / 7);
      
      for (let week = 1; week <= weeksInMonth; week++) {
        weeklyLabels.push(`Week ${week}`);
        weeklyValues.push(Math.floor(Math.random() * 20) + 5);
      }
      
      monthlyData[monthLabel] = {
        labels: weeklyLabels,
        values: weeklyValues
      };
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    
    // Age distribution data
    const ageLabels = ["0-18", "19-35", "36-50", "51-65", "65+"];
    const ageValues = [
      Math.floor(Math.random() * 40) + 10,
      Math.floor(Math.random() * 40) + 20,
      Math.floor(Math.random() * 40) + 30,
      Math.floor(Math.random() * 40) + 20,
      Math.floor(Math.random() * 40) + 10
    ];
    
    return {
      disease: diseases.find(d => d.id === diseaseId),
      monthlyData: {
        labels: monthlyLabels,
        values: monthlyValues
      },
      weeklyDataByMonth: monthlyData,
      ageDistribution: {
        labels: ageLabels,
        values: ageValues
      },
      totalCases: monthlyValues.reduce((sum, val) => sum + val, 0)
    };
  }

  // Simulation of backend data generation for top K diseases
  function generateTopKDiseases(startDate, endDate, k) {
    // Available diseases to choose from
    if (diseases.length === 0) return [];
    const allDiseases = diseases.slice(0);
    const selectedDiseases = [];
    
    // Total cases is a random number to simulate what would come from DB
    const totalCases = Math.floor(Math.random() * 1000) + 500;
    let remainingPercentage = 100;
    
    // Generate random top diseases
    let maxIter = Math.min(k, allDiseases.length);
    for (let i = 0; i < maxIter; i++) {
      // Remove a random disease from the array (to avoid duplicates)
      const randomIndex = Math.floor(Math.random() * allDiseases.length);
      const disease = allDiseases.splice(randomIndex, 1)[0];
      
      // Last disease gets the remaining percentage
      let percentage;
      if (i === maxIter - 1) {
        percentage = remainingPercentage;
      } else {
        // Random percentage, weighted to be higher for earlier diseases
        percentage = Math.min(
          remainingPercentage - 1, 
          Math.floor(Math.random() * remainingPercentage / 2) + (remainingPercentage / (k * 2))
        );
      }
      
      remainingPercentage -= percentage;
      
      // Calculate case count from percentage
      const count = Math.round((percentage * totalCases) / 100);
      
      selectedDiseases.push({
        id: disease.id,
        name: disease.name,
        count: count,
        percentage: percentage
      });
    }
    
    // Sort by count in descending order
    return selectedDiseases.sort((a, b) => b.count - a.count);
  }

  // Handle bar click to show weekly trend
  const handleBarClick = (_, elements) => {
    if (elements && elements.length > 0) {
      const monthIndex = elements[0].index;
      const monthName = diseaseData.monthlyData.labels[monthIndex];
      setSelectedMonth(monthName);
      setActiveTab("weekly");
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
  };

  // Prepare monthly chart data
const monthlyChartData = {
  labels: diseaseData?.monthlyData?.labels || [],
  datasets: [
    {
      label: `${diseases.find(d => d.id === selectedDisease)?.name || 'Disease'} Cases (Monthly)`,
      data: diseaseData?.monthlyData?.values || [],
      backgroundColor: "rgba(59, 130, 246, 0.5)",
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 2,
    },
  ],
};

// Prepare weekly chart data
const weeklyChartData = selectedMonth && diseaseData?.weeklyDataByMonth?.[selectedMonth] ? {
  labels: diseaseData.weeklyDataByMonth[selectedMonth].labels || [],
  datasets: [
    {
      label: `${diseases.find(d => d.id === selectedDisease)?.name || 'Disease'} Cases (${selectedMonth})`,
      data: diseaseData.weeklyDataByMonth[selectedMonth].values || [],
      backgroundColor: "rgba(139, 92, 246, 0.5)",
      borderColor: "rgba(139, 92, 246, 1)",
      borderWidth: 2,
      tension: 0.4,
    },
  ],
} : null;

// Prepare age distribution chart data
const ageDistributionChartData = {
  labels: diseaseData?.ageDistribution?.labels || [],
  datasets: [
    {
      label: "Age Distribution",
      data: diseaseData?.ageDistribution?.values || [],
      backgroundColor: [
        "rgba(16, 185, 129, 0.7)",
        "rgba(6, 182, 212, 0.7)",
        "rgba(251, 191, 36, 0.7)",
        "rgba(239, 68, 68, 0.7)",
        "rgba(124, 58, 237, 0.7)",
      ],
      borderColor: [
        "rgba(16, 185, 129, 1)",
        "rgba(6, 182, 212, 1)",
        "rgba(251, 191, 36, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(124, 58, 237, 1)",
      ],
      borderWidth: 1,
    },
  ],
};
  // Prepare top K diseases chart data
  const topKChartData = {
    labels: topKData.map(item => item.name),
    datasets: [
      {
        label: "Number of Cases",
        data: topKData.map(item => item.count),
        backgroundColor: Array(kValue).fill().map((_, i) => 
          `rgba(${30 + (i * 20)}, ${100 + (i * 15)}, ${180 - (i * 15)}, 0.7)`
        ),
        borderWidth: 1,
      },
    ],
  };

  // Loader component
  const Loader = () => (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  // Custom disease card component for top K diseases
  const DiseaseCard = ({ item, rank }) => {
    // Default icon for all diseases
    const defaultIcon = "🧬";
    
    return (
      <div className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        {/* Rank badge */}
        <div className="absolute top-0 left-0 bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-br-lg font-bold z-10">
          {rank}
        </div>
        
        <div className="p-5">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{defaultIcon}</span>
            <h3 className="text-lg font-semibold">{item.name}</h3>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Cases:</span>
            <span className="font-medium">{item.count}</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Percentage:</span>
            <span className="font-medium">{item.percentage.toFixed(1)}%</span>
          </div>
          
          {/* Distribution bar */}
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <div className="text-xs font-medium text-center text-gray-500 mb-1">
              Relative size compared to other top diseases
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  

  return (
    <div className="flex flex-col w-full p-6 bg-gray-50 min-h-screen">
  <h1 className="flex items-center text-3xl font-bold text-gray-800 mb-6">
    <FaVirus className="mr-3 text-blue-500" />
    Illness Trends Analysis
  </h1>

 {/*Add error display in UI:*/}
    {error && (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )}
  
  {/* Add error handling for empty data here*/}
  {diseases.length === 0 && !loading && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            No diagnoses found in the database.
          </p>
        </div>
      </div>
    </div>
  )}

  {!loading && diseaseData === null && selectedDisease && (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <p className="text-sm text-yellow-700">
        No trend data available for the selected disease and date range.
      </p>
    </div>
  )}
      
      {/* Disease Trends Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="flex items-center text-xl font-semibold text-gray-700 mb-6">
          <FaChartLine className="mr-2 text-blue-500" />
          Disease Trend Analysis
        </h2>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Disease selector */}
          <div className="flex flex-col flex-grow max-w-xs">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaVirus className="mr-1 text-blue-500" />
              Select Disease:
            </label>
            <div className="relative">
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={selectedDisease}
                onChange={(e) => setSelectedDisease(e.target.value)}
                disabled={loading || diseases.length === 0}
              >
                {diseases.map(disease => (
                  <option key={disease.id} value={disease.id}>
                    {disease.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Date range selector */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1 text-blue-500" />
              Start Date:
            </label>
            <DatePicker
              selected={trendStartDate}
              onChange={date => setTrendStartDate(date)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1 text-blue-500" />
              End Date:
            </label>
            <DatePicker
              selected={trendEndDate}
              onChange={date => setTrendEndDate(date)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="MMMM d, yyyy"
              minDate={trendStartDate}
            />
          </div>
        </div>
        
        {/* Trend tabs */}
        <div className="border-b border-gray-200 mb-4">
          <ul className="flex -mb-px">
            <li className="mr-1">
              <button
                className={`inline-block py-2 px-4 ${
                  activeTab === "monthly"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("monthly")}
              >
                Monthly Trend
              </button>
            </li>
            <li className="mr-1">
              <button
                className={`inline-block py-2 px-4 ${
                  activeTab === "weekly"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("weekly")}
                disabled={!selectedMonth}
              >
                Weekly Trend {selectedMonth ? `(${selectedMonth})` : ""}
              </button>
            </li>
          </ul>
        </div>
        
        {/* Disease info card */}
        {!loading && diseaseData && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <div className="flex items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {diseaseData.disease.name}
                </h3>
                <p className="text-gray-600">
                  Total of <span className="font-bold text-blue-600">{diseaseData.totalCases}</span> cases recorded between{" "}
                  {trendStartDate.toLocaleDateString()} and {trendEndDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="lg:col-span-3">
              <Loader />
            </div>
          ) : (
            <>
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg h-80 pb-17">
                {activeTab === "monthly" ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Monthly Trend</h3>
                    {diseaseData?.monthlyData?.labels?.length > 0 ? (
                      <>
                        <p className="text-sm text-gray-500 mb-2">Click on a bar to see weekly breakdown</p>
                        <Bar 
                          data={monthlyChartData} 
                          options={{
                            ...chartOptions,
                            onClick: handleBarClick
                          }}
                        />
                      </>
                    ) : (
                          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-center p-5">
                              <FaChartLine className="mx-auto text-gray-300 text-4xl mb-3" />
                              <p className="text-gray-500">No monthly data available for the selected date range.</p>
                              <p className="text-sm text-gray-400 mt-2">Try selecting a different date range or disease.</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-700">Weekly Trend</h3>
                        <button 
                          className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded"
                          onClick={() => setActiveTab("monthly")}
                        >
                          Back to Monthly View
                        </button>
                      </div>
                      {weeklyChartData && weeklyChartData.labels.length > 0 ? (
                        <Line data={weeklyChartData} options={chartOptions} />
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-center p-5">
                          <FaChartLine className="mx-auto text-gray-300 text-4xl mb-3" />
                          <p className="text-gray-500">No weekly data available for the selected month.</p>
                          <p className="text-sm text-gray-400 mt-2">Try selecting a different month from the bar chart.</p>
                        </div>
                      </div>
                    )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-gray-50 p-4 rounded-lg h-80">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Age Distribution</h3>
                  {diseaseData?.ageDistribution?.labels?.length > 0 ? (
                  <Pie 
                    data={ageDistributionChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} 
                  />
               ) : (<div className="flex items-center justify-center h-64">
                <div className="text-center p-5">
                  <FaChartLine className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-500">No age distribution data available.</p>
                </div>
              </div>
            )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Top K Diseases Section */}
      <div id="topk-section" className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="flex items-center text-xl font-semibold text-gray-700">
            <FaFilter className="mr-2 text-blue-500" />
            Top K Diseases Analysis
          </h2>
          
          {/* View toggle */}
          <div className="flex">
            <button 
              onClick={() => setViewType("chart")} 
              className={`px-3 py-1 rounded-l-md border ${viewType === "chart" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300"}`}
            >
              Chart View
            </button>
            <button 
              onClick={() => setViewType("cards")} 
              className={`px-3 py-1 rounded-r-md border ${viewType === "cards" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-300"}`}
            >
              Card View
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Date range selector */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1 text-blue-500" />
              Start Date:
            </label>
            <DatePicker
              selected={topKStartDate}
              onChange={date => setTopKStartDate(date)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaCalendarAlt className="mr-1 text-blue-500" />
              End Date:
            </label>
            <DatePicker
              selected={topKEndDate}
              onChange={date => setTopKEndDate(date)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="MMMM d, yyyy"
              minDate={topKStartDate}
            />
          </div>
          
          {/* K value selector */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1 flex items-center">
              <FaFilter className="mr-1 text-blue-500" />
              Top K Value:
            </label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max={diseases.length} // Set max to either 10 or the number of diseases, whichever is smaller
                value={kValue}
                onChange={(e) => setKValue(parseInt(e.target.value))}
                className="mr-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="bg-blue-100 text-blue-800 font-medium px-2.5 py-0.5 rounded">
                {kValue}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                (max: {diseases.length})
              </span>
            </div>
          </div>
        </div>
        
        {/* Top K visualization */}
        {loading ? (
          <Loader />
        ) : topKData.length > 0 ? (
            viewType === "chart" ? (
          <div className="h-96">
            <Bar 
              data={topKChartData} 
              options={{
                ...chartOptions,
                indexAxis: "y",
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    callbacks: {
                      label: function(context) {
                        return `Cases: ${context.raw} (${topKData[context.dataIndex].percentage.toFixed(1)}%)`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topKData.map((item, index) => (
              <DiseaseCard key={item.id} item={item} rank={index + 1} />
            ))}
          </div>
        )
      ) : (<div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center p-5">
          <FaFilter className="mx-auto text-gray-300 text-4xl mb-3" />
          <p className="text-gray-500">No disease data available for the selected date range.</p>
          <p className="text-sm text-gray-400 mt-2">Try selecting a different date range.</p>
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default IllnessTrends;
