import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManagePayrolls = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sample data - in a real application, this would come from an API
  const [employees, setEmployees] = useState([]);


  useEffect(() => {
    const fetchEmployees = async () => {
      try { 
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/search-employees`, {
          params: {
            searchQuery,
          },
        });
        console.log('Fetched Employees:', response.data);
        const employeesWithSelection = response.data.employees.map(emp => ({
          ...emp,
          selected: false, // Initialize selected state
        }));


        const payrollData = await axios.get(`${import.meta.env.VITE_API_URL}/common/findPayroll`, {
        });

        const payrolls = payrollData.data.payrolls;
        console.log('Fetched Payrolls:', payrolls);
        let employeesWithPayroll = employeesWithSelection
          .map(emp => {
            const payroll = payrolls.find(p => p.employee_id === emp._id && p.payment_status === 'pending');
            return payroll ? {
              ...emp,
              lastDate: new Date(payroll.month_year).toLocaleDateString(), // Format date
              salary: payroll.net_salary,
            } : null;
          })
          .filter(emp => emp !== null); // Filter out employees with no 'paid' payroll
        console.log('Employees with Payroll:', employeesWithPayroll);
        setEmployees(employeesWithPayroll);

      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    // Update selectedEmployees when individual employees are selected/deselected
    setSelectedEmployees(employees.filter(emp => emp.selected).map(emp => emp._id));
  }, [employees]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    // Update all employees' selected state
    const updatedEmployees = employees.map(emp => ({
      ...emp,
      selected: newSelectAll
    }));
    setEmployees(updatedEmployees);
  };

  const handleSelectEmployee = (id) => {
    const updatedEmployees = employees.map(emp =>
      emp._id === id ? { ...emp, selected: !emp.selected } : emp
    );
    setEmployees(updatedEmployees);

    // Update selectAll state based on if all employees are selected
    setSelectAll(updatedEmployees.every(emp => emp.selected));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search Query:', searchQuery);
    // In a real application, this would filter the employees list
    axios.get(`${import.meta.env.VITE_API_URL}/admin/search-employees`, {
      params: { searchQuery },
    })
      .then(response => {
      console.log('Search Results:', response.data);
      const employeesWithSelection = response.data.employees.map(emp => ({
        ...emp,
        selected: false, // Initialize selected state
      }));
      setEmployees(employeesWithSelection);
      })
      .catch(error => {
      console.error('Error fetching search results:', error);
      });
    console.log('Searching for:', searchQuery);
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to process payroll.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/process-payroll`, {
        employee_ids: selectedEmployees,
      });

      console.log('Process Payroll Response:', response);

      if (response.status === 200) {
        alert('Payroll processed successfully for selected employees.');
        // Reset selection after processing and set salary
        const updatedEmployees = employees.map(emp => ({
          ...emp,
          selected: false,
        }));


        setEmployees(updatedEmployees);
        setSelectAll(false);
      } else {
        alert('Failed to process payroll. Please try again.');
      }
    } catch (error) {
      console.error('Error :', error);
      alert('An error occurred while processing payroll.');
    }
  };

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({
    employee_id: '',
    basic_salary: '',
    allowance: '',
    deduction: '',
    net_salary: '',
  });

  useEffect(() => {
  }, [popupData.net_salary]);

  const handleUpdateSalary = (employee_id) => {
    setPopupData({
      employee_id,
      basic_salary: '',
      allowance: '',
      deduction: '',
      net_salary: '',
    });
    setShowPopup(true);
  };

  const calculateNetSalary = (name, value) => {
    const basic_salary = parseFloat(popupData.basic_salary) || 0;
    const allowance = parseFloat(popupData.allowance) || 0;
    const deduction = parseFloat(popupData.deduction) || 0;
    if (name === 'basic_salary') {
      return parseFloat(value) + allowance - deduction;
    }
    if (name === 'allowance') {
      return basic_salary + parseFloat(value) - deduction;
    }
    if (name === 'deduction') {
      return basic_salary + allowance - parseFloat(value);
    }
    return basic_salary + allowance - deduction;
  };

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    if (name === 'basic_salary' || name === 'allowance' || name === 'deduction') {
      setPopupData((prevData) => ({
        ...prevData,
        [name]: value,
        net_salary: calculateNetSalary(name, value),
      }));
    }
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Salary Data:', popupData);
    // Here you would typically send the updated salary data to the server
    axios.post(`${import.meta.env.VITE_API_URL}/admin/update-salary`, {
      employee_id: popupData.employee_id,
      basic_salary: popupData.basic_salary,
      allowance: popupData.allowance,
      deduction: popupData.deduction,
      net_salary: popupData.net_salary,
    }).then((response) => {
      let newEmployees = employees.map((emp) => {
        if (emp._id === popupData.employee_id) {
          return {
            ...emp,
            salary: popupData.net_salary,
          };
        }
        return emp;
      });
      setEmployees(newEmployees);
      alert('Salary updated successfully!');
    }).catch((error) => {
      console.error('Error updating salary:', error);
      alert('Failed to update salary. Please try again.');
    });
    // Reset popup data and close the popup
    setPopupData({
      employee_id: '',
      basic_salary: '',
      allowance: '',
      deduction: '',
      net_salary: '',
    });
    setShowPopup(false);;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Manage Payrolls</h2>

      <div className="max-w-4xl mx-auto">
        {/* Action buttons and search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleSelectAll}
            className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded"
          >
            Select All
          </button>

          <form onSubmit={handleSearch} className="flex-grow">
            <input
              type="text"
              placeholder="Search Employees by Keys"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
            />
          </form>

          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            onClick = {handleSearch}
          >
            Apply Filters
          </button>

          <button
            onClick={handleProcessPayroll}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Process Payroll
          </button>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left"></th>
                <th className="py-2 px-4 text-left font-medium">Employee ID</th>
                <th className="py-2 px-4 text-left font-medium">Emp. Name</th>
                <th className="py-2 px-4 text-left font-medium">Last Date</th>
                <th className="py-2 px-4 text-left font-medium">Net Salary</th>
              </tr>
            </thead>
            <tbody>
  {employees && employees.length > 0 ? (
    employees.map((employee) => (
      <tr key={employee._id} className="border-b bg-gray-100">
        <td className="py-2 px-4">
          <input
            type="checkbox"
            checked={employee.selected}
            onChange={() => handleSelectEmployee(employee._id)}
            className="w-4 h-4"
          />
        </td>
        <td className="py-2 px-4">{employee._id}</td>
        <td className="py-2 px-4">{employee.name}</td>
        <td className="py-2 px-4">{employee.lastDate}</td>
        <td className="py-2 px-4">{employee.salary}</td>
        <td className="py-2 px-4">
          <button
            onClick={() => handleUpdateSalary(employee._id)}
            className="bg-blue-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Update Salary
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr className="border-b bg-gray-100">
      <td className="py-2 px-4" colSpan="6">
        No employees found with pending payroll.
      </td>
    </tr>
  )}
</tbody>

          </table>
        </div>
      </div>

      {/* Popup for updating salary */}
      {showPopup && (
        <div className="fixed inset-0 flex justify-center items-center border-2 border-gray-300 ">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Update Salary</h3>
            <form onSubmit={handlePopupSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Basic Salary</label>
                <input
                  type="text"
                  name="basic_salary"
                  value={popupData.basic_salary}
                  onChange={handlePopupChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Allowance</label>
                <input
                  type="text"
                  name="allowance"
                  value={popupData.allowance}
                  onChange={handlePopupChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">New Deduction</label>
                <input
                  type="text"
                  name="deduction"
                  value={popupData.deduction}
                  onChange={handlePopupChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Net Salary</label>
                <input
                  type="text"
                  name="net_salary"
                  value={popupData.net_salary}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePayrolls;
