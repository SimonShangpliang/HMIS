import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddReport = () => {
  const [patientId, setPatientId] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    if (selectedConsultation) {
      const consultation = consultations.find(c => c._id === selectedConsultation);
      const consultationTests = consultation?.reports || [];
      setAvailableTests(consultationTests);
    } else {
      setAvailableTests(allTests);
    }
  }, [selectedConsultation, consultations]);

  const searchPatient = async () => {
    if (!patientId) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pathologists/searchById`, {
        params: {
          searchById: patientId
        }
      });
      const data = response.data;
      console.log('Patient data:', data);
      setPatientData(data.patient);
      setConsultations(data.consultations || []);
      setAllTests(data.tests || []);
      setAvailableTests(data.tests || []);
      setSelectedConsultation('');
      setSelectedTest('');
      setReportTitle('');
      setReportType('');
      setReportDescription('');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setPatientData(null);
      setAllTests([]);
      setAvailableTests([]);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !patientId) {
      setError('Please select a file and enter patient ID');
      return;
    }

    if (!reportTitle || !reportType || !selectedConsultation) {
      setError('Please fill all required fields including consultation selection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('reportFile', selectedFile);
      formData.append('patientId', patientId);
      formData.append('reportTitle', reportTitle);
      formData.append('reportType', reportType);
      formData.append('description', reportDescription);
      formData.append('consultationId', selectedConsultation);

      if (selectedTest) {
        formData.append('testId', selectedTest);
      }

      const url = `${import.meta.env.VITE_API_URL}/pathologists/uploadReport`;
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Report uploaded successfully!');
      setSelectedTest('');
      setSelectedFile(null);
      setFileName('');
      setReportTitle('');
      setReportType('');
      setReportDescription('');
      searchPatient();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Add Medical Report</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <label htmlFor="patientId" className="text-gray-700 font-medium w-1/4">
                Patient ID:
              </label>
              <div className="flex flex-1">
                <input
                  type="text"
                  id="patientId"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={searchPatient}
                  disabled={loading || !patientId}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-r-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Search'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {patientData && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">{patientData.patient_info.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <p className="font-medium">{patientData.patient_info.bloodGrp}</p>
                </div>
              </div>
            </div>
          )}

          {patientData && (
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div className="space-y-2">
                <label htmlFor="consultationSelect" className="block text-sm font-medium text-gray-700">
                  Select Consultation <span className="text-red-500">*</span>
                </label>
                <select
                  id="consultationSelect"
                  value={selectedConsultation}
                  onChange={(e) => {
                    setSelectedConsultation(e.target.value);
                    setSelectedTest('');
                  }}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a consultation</option>
                  {consultations.map((consultation) => {
                    if (consultation.status !== 'cancelled') {
                      return (
                        <option key={consultation._id} value={consultation._id}>
                          {new Date(consultation.actual_start_datetime).toLocaleDateString()} - {consultation.reason || 'No reason'}
                        </option>);
                    }
                  })}
                </select>
              </div>

              {availableTests.length > 0 && (
                <div className="space-y-2">
                  <label htmlFor="testSelect" className="block text-sm font-medium text-gray-700">
                    Update Existing Test (Optional)
                  </label>
                  <select
                    id="testSelect"
                    value={selectedTest}
                    onChange={(e) => setSelectedTest(e.target.value)}
                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select a test to update</option>
                    {availableTests.map((test) => (
                      <option key={test._id} value={test._id}>
                        {test.title} {test.status === 'pending' ? '(Pending)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="reportTitle" className="block text-sm font-medium text-gray-700">
                    Report Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reportTitle"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter report title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter report type"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reportDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="mt-1 w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter report description/findings"
                    rows={4}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Choose File
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        required
                      />
                    </label>
                    {fileName && (
                      <p className="mt-2 text-sm text-gray-500">
                        Selected: {fileName}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedFile || loading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload Report'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddReport;