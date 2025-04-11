import React, { useState, useEffect } from 'react';

const ManagePayrolls = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Sample data - in a real application, this would come from an API
  const [employees, setEmployees] = useState([
    { id: '12345', name: 'XYZ', lastDate: '26th Feb', selected: false },
    { id: '12346', name: 'XYZ', lastDate: '26th Feb', selected: false },
    { id: '12347', name: 'XYZ', lastDate: '26th Feb', selected: false },
  ]);

  useEffect(() => {
    // Update selectedEmployees when individual employees are selected/deselected
    setSelectedEmployees(employees.filter(emp => emp.selected).map(emp => emp.id));
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
      emp.id === id ? { ...emp, selected: !emp.selected } : emp
    );
    setEmployees(updatedEmployees);

    // Update selectAll state based on if all employees are selected
    setSelectAll(updatedEmployees.every(emp => emp.selected));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real application, this would filter the employees list
    console.log('Searching for:', searchQuery);
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to process payroll.');
      return;
    }

    try {
      const response = await fetch('/admin/process-payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeIds: selectedEmployees }),
      });

      if (response.ok) {
        alert('Payroll processed successfully for selected employees.');
        // Reset selection after processing
        setEmployees(employees.map(emp => ({ ...emp, selected: false })));
        setSelectAll(false);
      } else {
        alert('Failed to process payroll. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payroll:', error);
      alert('An error occurred while processing payroll.');
    }
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
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b bg-gray-100">
                  <td className="py-2 px-4">
                    <input
                      type="checkbox"
                      checked={employee.selected}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="py-2 px-4">{employee.id}</td>
                  <td className="py-2 px-4">{employee.name}</td>
                  <td className="py-2 px-4">{employee.lastDate}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => alert(`Update salary for employee ID: ${employee.id}`)}
                      className="bg-blue-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Update Salary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePayrolls;
