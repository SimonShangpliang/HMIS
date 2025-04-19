import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  FaBed, FaCalendarAlt, FaChartBar, FaChartLine,
  FaArrowUp, FaArrowDown, FaMinus, FaStar,
  FaExclamationCircle, FaSyncAlt, FaChartArea
} from 'react-icons/fa';

const BedOccupancyTrends = () => {
  // State management
  const [startDate, setStartDate] = useState('2024-09-10');
  const [endDate, setEndDate] = useState('2025-04-15');
  const [period, setPeriod] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [bedType, setBedType] = useState('all');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState('');
  const [filterVisible, setFilterVisible] = useState(true);


  const handleStartDateChange = (e)=>{
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (endDate && endDate < newStartDate) {
      setEndDate("");
    }
  }

  // Validate date range
  const validateDates = () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        setError('End date must be after start date');
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setError('Invalid date format');
      return false;
    }
  };

  // Fetch data from API
  const fetchData = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError(null);
    setErrorDetails('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/analytics/occupied-beds/${period}`,
        {
          startDate,
          endDate,
          bedType
        }
      );

      if (response.data && response.data.trends) {
        setTrends(response.data.trends);
      } else {
        setError('No data available for the selected period');
      }
    } catch (err) {
      console.error("Error details:", err);
      setError('Failed to fetch data');
      setErrorDetails(err.response?.data?.message || err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (validateDates()) {
      fetchData();
    }
  }, [period, bedType]); // Auto-fetch when period or bedType changes

  // Format data for visualization
  const formatChartData = (data) => {
    if (!data || !data.length) return [];

    return data.map(item => {
      const label = period === 'weekly'
        ? formatWeekLabel(item.week)
        : formatMonthLabel(item.month);

      return {
        name: label,
        occupied: item.occupied,
        vacated: item.vacated,
        netOccupancy: item.netOccupancy,
        color: getTrendColor(item.netOccupancy, data)
      };
    });
  };

  const formatWeekLabel = (week) => {
    if (!week) return '';
    // Format from "2023-W01" to "Week 1"
    const parts = week.split('-W');
    return `Week ${parseInt(parts[1])}`;
  };

  const formatMonthLabel = (month) => {
    if (!month) return '';
    // Format from "2023-01" to "Jan"
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleString('default', { month: 'short' });
  };

  // Determine color based on occupancy value
  const getTrendColor = (value, data) => {
    if (!data || data.length === 0) return '#3B82F6';

    const values = data.map(item => item.netOccupancy);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    // Normalize value between 0 and 1
    let ratio;
    if (range === 0) {
      ratio = 0.5; // Default to middle if all values are the same
    } else {
      ratio = (value - min) / range;
    }

    if (ratio > 0.8) return '#EF4444'; // red-500
    if (ratio > 0.6) return '#F59E0B'; // amber-500
    if (ratio > 0.4) return '#10B981'; // emerald-500
    if (ratio > 0.2) return '#3B82F6'; // blue-500
    return '#6366F1'; // indigo-500
  };

  // Calculate overview statistics
  const calculateOverview = () => {
    if (!trends || trends.length === 0) return null;

    let totalOccupied = 0;
    let totalVacated = 0;

    trends.forEach(item => {
      totalOccupied += item.occupied;
      totalVacated += item.vacated;
    });

    const netOccupancyValues = trends.map(item => item.netOccupancy);
    const maxOccupancy = Math.max(...netOccupancyValues);
    const minOccupancy = Math.min(...netOccupancyValues);

    // Calculate trend direction
    const firstValue = netOccupancyValues[0];
    const lastValue = netOccupancyValues[netOccupancyValues.length - 1];
    const trend = lastValue > firstValue ? 'increasing' : lastValue < firstValue ? 'decreasing' : 'stable';

    // Calculate percentage change
    const percentChange = firstValue !== 0
      ? Math.round(((lastValue - firstValue) / Math.abs(firstValue)) * 100)
      : 0;

    return {
      totalOccupied,
      totalVacated,
      netTotal: totalOccupied - totalVacated,
      maxOccupancy,
      minOccupancy,
      trend,
      percentChange
    };
  };

  const overview = calculateOverview();
  const chartData = formatChartData(trends);

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-md shadow-lg border border-gray-100 text-sm">
          <p className="font-medium text-gray-800">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="flex items-center text-gray-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>New Occupied: <span className="font-medium">{payload[0]?.value || 0}</span></span>
            </p>
            <p className="flex items-center text-gray-600">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              <span>Vacated: <span className="font-medium">{payload[1]?.value || 0}</span></span>
            </p>
            <p className="flex items-center text-gray-700 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              <span>Net Occupancy: <span>{payload[2]?.value || 0}</span></span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render appropriate chart based on selected type
  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null;

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
            <YAxis tick={{ fill: '#4B5563' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="occupied" name="New Occupied" fill="#10B981" stackId="a" />
            <Bar dataKey="vacated" name="Vacated" fill="#EF4444" stackId="a" />
            <Bar dataKey="netOccupancy" name="Net Occupancy" fill="#3B82F6" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
            <YAxis tick={{ fill: '#4B5563' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="occupied"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10B981' }}
              name="New Occupied"
            />
            <Line
              type="monotone"
              dataKey="vacated"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 3, fill: '#EF4444' }}
              name="Vacated"
            />
            <Line
              type="monotone"
              dataKey="netOccupancy"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 8 }}
              name="Net Occupancy"
            />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorVacated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563' }} />
            <YAxis tick={{ fill: '#4B5563' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupied"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorOccupied)"
              name="New Occupied"
            />
            <Area
              type="monotone"
              dataKey="vacated"
              stroke="#EF4444"
              fillOpacity={1}
              fill="url(#colorVacated)"
              name="Vacated"
            />
            <Area
              type="monotone"
              dataKey="netOccupancy"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorNet)"
              name="Net Occupancy"
            />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  // Sparkline component for stat cards
  const SparkLine = ({ data, color }) => {
    if (!data || data.length === 0) return null;

    // Normalize data to fit in a small space
    const values = [...data];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const normalized = values.map(v => range === 0 ? 0.5 : (v - min) / range);

    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <path
          d={`M0,${24 - normalized[0] * 24} ${normalized.map((p, i) => `L${i * (60 / (normalized.length - 1))},${24 - p * 24}`).join(' ')}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaBed className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-800">Bed Occupancy Trends</h1>
          </div>
          <button
            onClick={() => setFilterVisible(!filterVisible)}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
          >
            {filterVisible ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Controls */}
        {filterVisible && (
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm mb-6 overflow-hidden transition-all duration-300">
            <div className="p-5">
              <div className="grid grid-cols-12 gap-4 mb-5">
                {/* Date filters */}
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={handleStartDateChange}
                        className="w-full rounded-md border-gray-200 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                    <span className="text-gray-300 pt-5">→</span>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
                      <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border-gray-200 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Period selector */}
                <div className="col-span-12 md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">View By</label>
                  <div className="bg-gray-50 rounded-full p-1 flex">
                    <button
                      type="button"
                      onClick={() => setPeriod('weekly')}
                      className={`rounded-full px-3 py-1 text-xs font-medium flex-1 transition-all ${period === 'weekly'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriod('monthly')}
                      className={`rounded-full px-3 py-1 text-xs font-medium flex-1 transition-all ${period === 'monthly'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                {/* Bed Type */}
                <div className="col-span-12 md:col-span-3">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Bed Type</label>
                  <select
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    className="w-full rounded-md border-gray-200 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="all">All Beds</option>
                    <option value="private">Private</option>
                    <option value="semi_private">Semi-Private</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Chart Type */}
                <div className="col-span-12 md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Chart Type</label>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setChartType('bar')}
                      className={`p-2 rounded-md transition-all flex-1 ${chartType === 'bar'
                          ? 'bg-blue-50 text-blue-500'
                          : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <FaChartBar className="mx-auto" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType('line')}
                      className={`p-2 rounded-md transition-all flex-1 ${chartType === 'line'
                          ? 'bg-blue-50 text-blue-500'
                          : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <FaChartLine className="mx-auto" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartType('area')}
                      className={`p-2 rounded-md transition-all flex-1 ${chartType === 'area'
                          ? 'bg-blue-50 text-blue-500'
                          : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      <FaChartArea className="mx-auto" size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-5 rounded-r-md">
                  <div className="flex items-center">
                    <FaExclamationCircle className="h-4 w-4 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  {errorDetails && (
                    <p className="text-xs text-red-500 mt-1 ml-6">{errorDetails}</p>
                  )}
                </div>
              )}

              <button
                onClick={fetchData}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center text-sm"
              >
                <FaSyncAlt className="h-3 w-3 mr-2" />
                Update Chart
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">New Occupied</span>
                <span className="text-xs font-medium text-green-500 flex items-center">
                  <FaArrowUp className="h-3 w-3 mr-1" />
                  {overview.trend === 'increasing' && overview.percentChange > 0 ? `${overview.percentChange}%` : ''}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-800">{overview.totalOccupied}</span>
                {trends.length > 1 && (
                  <SparkLine data={trends.map(t => t.occupied)} color="#10B981" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Vacated</span>
                <span className="text-xs font-medium text-red-500 flex items-center">
                  <FaArrowDown className="h-3 w-3 mr-1" />
                  {overview.trend === 'decreasing' && overview.percentChange < 0 ? `${Math.abs(overview.percentChange)}%` : ''}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-800">{overview.totalVacated}</span>
                {trends.length > 1 && (
                  <SparkLine data={trends.map(t => t.vacated)} color="#EF4444" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Net Occupancy</span>
                <span className="text-xs font-medium text-blue-500 flex items-center">
                  <FaStar className="h-3 w-3 mr-1" />
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-800">{overview.netTotal}</span>
                {trends.length > 1 && (
                  <SparkLine data={trends.map(t => t.netOccupancy)} color="#3B82F6" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Trend</span>
                {overview.trend === 'increasing' ? (
                  <FaArrowUp className="h-3 w-3 text-green-500" />
                ) : overview.trend === 'decreasing' ? (
                  <FaArrowDown className="h-3 w-3 text-red-500" />
                ) : (
                  <FaMinus className="h-3 w-3 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-semibold text-gray-800 capitalize">{overview.trend}</span>
                <span className={`ml-2 text-sm font-medium ${overview.trend === 'increasing' ? 'text-green-500' :
                    overview.trend === 'decreasing' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                  {overview.percentChange > 0 ? '+' : ''}{overview.percentChange}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart Area */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">Loading data...</p>
            </div>
          ) : trends.length > 0 ? (
            <div className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  {period === 'weekly' ? 'Weekly' : 'Monthly'} Bed Occupancy
                </h2>
                <p className="text-sm text-gray-500">
                  {bedType === 'all' ? 'All Bed Types' : `${bedType.charAt(0).toUpperCase() + bedType.slice(1).replace('_', '-')} Beds`}
                </p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <FaExclamationCircle className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-800 mb-1">No Data Available</h3>
              <p className="text-sm text-gray-500 max-w-md">
                No data available for the selected period and bed type. Please adjust your filters and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BedOccupancyTrends;
