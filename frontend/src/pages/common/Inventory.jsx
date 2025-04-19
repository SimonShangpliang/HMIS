import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';

const Inventory = () => {
  const role = localStorage.getItem("role");
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryType, setInventoryType] = useState('medicine');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalMode, setModalMode] = useState('update'); // 'update' or 'add'
  const [updateForm, setUpdateForm] = useState({
    med_name: '',
    effectiveness: 'medium',
    dosage_form: 'tablet',
    manufacturer: '',
    quantity: '',
    batch_no: '',
    expiry_date: '',
    manufacturing_date: '',
    unit_price: '',
    supplier: ''
  });
  const [viewMode, setViewMode] = useState('inventory'); // 'inventory' or 'pending'

  const [equipmentForm, setEquipmentForm] = useState({
    equipment_name: '',
    quantity: '',
    installation_date: '',
    last_service_date: '',
    next_service_date: ''
  });

  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const showToggle = ['doctor', 'admin', 'nurse'].includes(role);

  // Initialize inventory type based on role
  useEffect(() => {
    if (role === 'pharmacist') setInventoryType('medicine');
    else if (role === 'pathologist') setInventoryType('equipment');
  }, [role]);

  const handleMfgDateChange_med = (e) => {
    const newMfgDate = e.target.value;
    setUpdateForm(prev => {
      // If expiry_date is before newMfgDate, clear expiry_date
      if (prev.expiry_date && prev.expiry_date < newMfgDate) {
        return {
          ...prev,
          manufacturing_date: newMfgDate,
          expiry_date: ''
        };
      }
      // Otherwise, just update manufacturing_date
      return {
        ...prev,
        manufacturing_date: newMfgDate
      };
    });
  };

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/inventory/search`, {
        params: {
          searchQuery: searchTerm.trim(),
          page: pagination.page,
          limit: 10,
          type: inventoryType,
          role,
          viewMode
        }
      });

      setInventory(response.data.items);
      setPagination({
        page: response.data.page,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage
      });
    } catch (err) {
      setError('Failed to fetch inventory data');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when search term, page or inventory type changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInventory();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pagination.page, inventoryType, viewMode]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleToggleInventory = () => {
    setInventoryType(prev => prev === 'medicine' ? 'equipment' : 'medicine');
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleModalOpen = (mode, item = null) => {
    setModalMode(mode);
    if (mode === 'update' && item) {
      if (inventoryType === 'medicine') {
        setSelectedMedicine(item);
        setUpdateForm(prev => ({
          ...prev,
          med_name: item.name,
          manufacturer: item.manufacturer
        }));
      } else {
        setSelectedEquipment(item);
        setEquipmentForm({
          equipment_name: item.name,
          quantity: item.quantity,
          last_service_date: formatDate(item.last_service_date),
          next_service_date: formatDate(item.next_service_date)
        });
      }
    } else {
      setSelectedMedicine(null);
      setSelectedEquipment(null);
      setUpdateForm({
        med_name: '',
        effectiveness: 'medium',
        dosage_form: 'tablet',
        manufacturer: '',
        quantity: '',
        batch_no: '',
        expiry_date: '',
        manufacturing_date: '',
        unit_price: '',
        supplier: ''
      });
      setEquipmentForm({
        equipment_name: '',
        quantity: '',
        installation_date: '',
        last_service_date: '',
        next_service_date: ''
      });
    }
    setShowUpdateModal(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        ...updateForm,
        ...(modalMode === 'update' && { medicineId: selectedMedicine.id }),
        available: true,
        order_status: role === 'pharmacist' ? 'requested' : 'ordered'
      };

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/admin/update-inventory`, payload);

      if (response.status === 200 || response.status === 201) {
        fetchInventory();
        setShowUpdateModal(false);
        setSelectedMedicine(null);
        setUpdateForm({
          med_name: '',
          effectiveness: 'medium',
          dosage_form: 'tablet',
          manufacturer: '',
          quantity: '',
          batch_no: '',
          expiry_date: '',
          manufacturing_date: '',
          unit_price: '',
          supplier: ''
        });
      }
    } catch (err) {
      setError(`Failed to ${modalMode} medicine`);
      console.error(`Error ${modalMode}ing medicine:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquipmentSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        inventoryType: 'equipment',
        equipment_name: equipmentForm.equipment_name,
        quantity: equipmentForm.quantity,
        installation_date: equipmentForm.installation_date,
        next_service_date: equipmentForm.next_service_date,
        order_status: role === 'pathologist' ? 'requested' : 'ordered'
      };

      if (modalMode === 'update') {
        payload.itemId = selectedEquipment.id;
        payload.last_service_date = equipmentForm.last_service_date;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/update-inventory`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        fetchInventory();
        setShowUpdateModal(false);
        setSelectedEquipment(null);
        setEquipmentForm({
          equipment_name: '',
          quantity: '',
          installation_date: '',
          last_service_date: '',
          next_service_date: ''
        });
      }
    } catch (err) {
      setError(`Failed to ${modalMode} equipment`);
      console.error(`Error ${modalMode}ing equipment:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (status) => {
    try {
      setLoading(true);

      const payload = {
        inventoryType,
        itemId: inventoryType === 'medicine' ? selectedMedicine.id : selectedEquipment.id,
        order_status: status
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/update-order-status`,
        payload
      );

      if (response.status === 200) {
        fetchInventory();
        setShowUpdateModal(false);
        setSelectedMedicine(null);
        setSelectedEquipment(null);
      }
    } catch (err) {
      setError(`Failed to ${status} order`);
      console.error(`Error ${status}ing order:`, err);
    } finally {
      setLoading(false);
    }
  };

  const paginationControls = (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        disabled={!pagination.hasPrevPage}
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        disabled={!pagination.hasNextPage}
        className="p-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const medicineColumns = (
    <tr className="bg-gray-100">
      <th className="p-3 text-left">ID</th>
      <th className="p-3 text-left">Medicine Name</th>
      <th className="p-3 text-left">Manufacturer</th>
      {viewMode === 'inventory' ? (
        <>
          <th className="p-3 text-left">Available Quantity</th>
          <th className="p-3 text-left">Status</th>
        </>
      ) : (<th className="p-3 text-left">Quantity Requested</th>)}
      {role === 'admin' && <th className="p-3 text-left">Actions</th>}
    </tr>
  );

  const medicineRow = (item) => (
    <tr key={item.id} className="bg-gray-800 text-white rounded-md">
      <td className="p-3 rounded-l-md">{item.id}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.manufacturer}</td>
      <td className="p-3">{item.quantity}</td>
      {viewMode === 'inventory' && (
        <>
          <td className={`p-3 ${!item.available ? 'text-red-300' : 'text-green-300'
            } ${role !== 'admin' ? 'rounded-r-md' : ''}`}>
            {item.available ? 'Available' : `Expected: ${item.next_availability}`}
          </td>
        </>
      )}
      {role === 'admin' && (
        <td className="p-3 rounded-r-md">
          <button
            onClick={() => handleModalOpen('update', item)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
          >
            {viewMode === 'pending' && item.order_status === 'requested' ? 'Review Order' : 'Update'}
          </button>
        </td>
      )}
    </tr>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  const equipmentRow = (item) => (
    <tr key={item.id} className="bg-gray-800 text-white rounded-md">
      <td className="p-3 rounded-l-md">{item.id}</td>
      <td className="p-3">{item.name}</td>
      <td className="p-3">{item.quantity}</td>
      {viewMode === 'inventory' && (
        <>
          <td className="p-3">{formatDate(item.last_service_date)}</td>
          <td className="p-3">{formatDate(item.next_service_date)}</td>
          <td className={`p-3 ${item.service_status === 'Overdue' ? 'text-red-300' :
              item.service_status === 'Due Soon' ? 'text-yellow-300' :
                'text-green-300'
            } ${role !== 'admin' ? 'rounded-r-md' : ''}`}>
            {item.service_status}
          </td>
        </>
      )}
      {role === 'admin' && (
        <td className="p-3 rounded-r-md">
          <button
            onClick={() => handleModalOpen('update', item)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
          >
            {viewMode === 'pending' && item.order_status === 'requested' ? 'Review Order' : 'Update'}
          </button>
        </td>
      )}
    </tr>
  );

  const renderModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowUpdateModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6">
          {modalMode === 'update'
            ? 'Update Medicine'
            : role === 'pharmacist'
              ? 'Order Medicine'
              : 'Add New Medicine'}
        </h2>
        {(viewMode === 'pending' && modalMode === 'update') ? (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Order Request</h3>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-medium">Name:</span> {selectedMedicine?.name}</p>
              <p><span className="font-medium">Quantity:</span> {selectedMedicine?.quantity}</p>
              {/* Add other relevant details */}
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                onClick={() => handleOrderStatusUpdate('cancelled')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject Order
              </button>
              <button
                onClick={() => handleOrderStatusUpdate('ordered')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept Order
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* New fields for Add mode */}
            {modalMode === 'add' && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    value={updateForm.med_name}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, med_name: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={updateForm.manufacturer}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Effectiveness</label>
                  <select
                    value={updateForm.effectiveness}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, effectiveness: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dosage Form</label>
                  <select
                    value={updateForm.dosage_form}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, dosage_form: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="cream">Cream</option>
                    <option value="ointment">Ointment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Inventory fields in grid */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={updateForm.batch_no}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, batch_no: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Date</label>
                <input
                  type="date"
                  value={updateForm.manufacturing_date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleMfgDateChange_med}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  min={updateForm.manufacturing_date}
                  value={updateForm.expiry_date}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  value={updateForm.unit_price}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, unit_price: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={updateForm.supplier}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, supplier: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium mt-6"
            >
              {modalMode === 'update' ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderEquipmentModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowUpdateModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-semibold mb-6">
          {modalMode === 'update'
            ? 'Update Equipment'
            : role === 'pathologist'
              ? 'Order Equipment'
              : 'Add New Equipment'}
        </h2>
        {(viewMode === 'pending' && modalMode === 'update') ? (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Equipment Request</h3>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-medium">Name:</span> {selectedEquipment?.name}</p>
              <p><span className="font-medium">Quantity:</span> {selectedEquipment?.quantity}</p>
              {/* Add other relevant details */}
            </div>
            <div className="flex gap-4 justify-end mt-6">
              <button
                onClick={() => handleOrderStatusUpdate('cancelled')}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject Order
              </button>
              <button
                onClick={() => handleOrderStatusUpdate('ordered')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept Order
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={equipmentForm.equipment_name}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, equipment_name: e.target.value }))}
                  className={`p-2 w-full border rounded focus:ring-2 focus:ring-blue-500 ${modalMode === 'update' ? 'bg-gray-100' : ''
                    }`}
                  required
                  readOnly={modalMode === 'update'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={equipmentForm.quantity}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              {modalMode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
                  <input
                    type="date"
                    value={equipmentForm.installation_date}
                    max = {new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, installation_date: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
              {modalMode === 'update' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={equipmentForm.last_service_date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, last_service_date: e.target.value }))}
                    className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date</label>
                <input
                  type="date"
                  value={equipmentForm.next_service_date}
                  min={
                    new Date().toISOString().split('T')[0]// next service date never in past
                  }
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, next_service_date: e.target.value }))}
                  className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleEquipmentSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium mt-6"
            >
              {modalMode === 'update' ? 'Update Equipment' : 'Add Equipment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabs = () => {
    if (role !== 'admin') return null;

    return (
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewMode('inventory')}
            className={`${viewMode === 'inventory'
                ? 'border-blue-500 text-blue-600 border-b-2'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 font-medium`}
          >
            Inventory
          </button>
          <button
            onClick={() => setViewMode('pending')}
            className={`${viewMode === 'pending'
                ? 'border-blue-500 text-blue-600 border-b-2'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 font-medium`}
          >
            Pending Requests
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {inventoryType === 'medicine' ? 'Medicine Inventory' : 'Equipment Inventory'}
        </h1>

        {/* Right-side buttons */}
        <div className="flex items-center space-x-4">
          {/* Toggle Button - Only shown for doctor, admin, nurse */}
          {showToggle && (
            <button
              onClick={handleToggleInventory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Switch to {inventoryType === 'medicine' ? 'Equipment' : 'Medicine'} Inventory
            </button>
          )}

          {/* Pharmacist: Order Medicines */}
          {role === 'pharmacist' && inventoryType === 'medicine' && (
            <button
              onClick={() => handleModalOpen('add')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Order Medicines
            </button>
          )}

          {/* Pathologist: Order Equipment */}
          {role === 'pathologist' && inventoryType === 'equipment' && (
            <button
              onClick={() => handleModalOpen('add')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Order Equipment
            </button>
          )}

          {/* Admin: Add Medicine/Equipment */}
          {role === 'admin' && (
            <button
              onClick={() => handleModalOpen('add')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              Add {inventoryType === 'medicine' ? 'Medicine' : 'Equipment'}
            </button>
          )}
        </div>
      </div>

      {role === 'admin' && renderTabs()}

      {/* Search Bar */}
      <div className="mb-6 relative mx-auto">
        <input
          type="text"
          placeholder={`Search by ${inventoryType === 'medicine' ? 'medicine' : 'equipment'} name or ID...`}
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded-md pr-10"
        />
        <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center py-4">
          <p>Loading inventory...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Tables with updated data mapping */}
      {!loading && !error && (
        <>
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">
                {viewMode === 'pending'
                  ? 'No pending requests found'
                  : `No ${inventoryType} items found`}
              </p>
            </div>
          ) : (
            <>
              {inventoryType === 'medicine' ? (
                <div className="overflow-x-auto">
                  <table className="w-3/4 mx-auto border-separate border-spacing-y-2">
                    <thead>
                      {medicineColumns}
                    </thead>
                    <tbody>
                      {inventory.map(medicineRow)}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Equipment table with similar updates
                <div className="overflow-x-auto">
                  <table className="w-3/4 mx-auto border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Equipment Name</th>
                        {viewMode === "inventory" ? (
                          <>
                            <th className="p-3 text-left">Available Quantity</th>
                            <th className="p-3 text-left">Last Service Date</th>
                            <th className="p-3 text-left">Next Service Date</th>
                            <th className="p-3 text-left">Service Status</th>
                          </>
                        ) : (
                          <th className="p-3 text-left">Quantity Requested</th>
                        )}
                        {role === 'admin' && <th className="p-3 text-left">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(equipmentRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Pagination Controls - Only show if there are items */}
          {inventory.length > 0 && paginationControls}
        </>
      )}

      {/* Update Quantity Modal */}
      {showUpdateModal && (inventoryType === 'medicine' ? renderModal() : renderEquipmentModal())}
    </div>
  );
};

export default Inventory;