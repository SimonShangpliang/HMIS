import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, X, Plus, Package, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return dateString.split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {inventoryType === 'medicine' ? (
                <Package className="h-8 w-8 text-blue-600" />
              ) : (
                <Wrench className="h-8 w-8 text-blue-600" />
              )}
              <h1 className="text-2xl font-bold text-gray-800">
                {inventoryType === 'medicine' ? 'Medicine Inventory' : 'Equipment Inventory'}
              </h1>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {showToggle && (
                <button
                  onClick={handleToggleInventory}
                  className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  <span>Switch to {inventoryType === 'medicine' ? 'Equipment' : 'Medicine'}</span>
                  {inventoryType === 'medicine' ? <Wrench className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                </button>
              )}

              {(role === 'pharmacist' && inventoryType === 'medicine') ||
                (role === 'pathologist' && inventoryType === 'equipment') ||
                role === 'admin' ? (
                <button
                  onClick={() => handleModalOpen('add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    {role === 'admin'
                      ? `Add ${inventoryType === 'medicine' ? 'Medicine' : 'Equipment'}`
                      : `Order ${inventoryType === 'medicine' ? 'Medicines' : 'Equipment'}`}
                  </span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <input
              type="text"
              placeholder={`Search ${inventoryType} by name or ID...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Admin Tabs */}
        {role === 'admin' && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setViewMode('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                  viewMode === 'inventory'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setViewMode('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                  viewMode === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Requests
              </button>
            </nav>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Inventory Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {inventoryType === 'medicine' ? (
                    <Wrench className="h-12 w-12 mx-auto" />
                  ) : (
                    <Wrench className="h-12 w-12 mx-auto" />
                  )}
                </div>
                <p className="text-gray-500 text-lg">
                  {viewMode === 'pending'
                    ? 'No pending requests found'
                    : `No ${inventoryType} items found`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {inventoryType === 'medicine' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          {role === 'admin' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          )}
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          {role === 'admin' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          )}
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition duration-150"
                      >
                        {inventoryType === 'medicine' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.manufacturer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {item.available ? 'Available' : `Expected: ${item.next_availability}`}
                              </span>
                            </td>
                            {role === 'admin' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleModalOpen('update', item)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  {viewMode === 'pending' && item.order_status === 'requested' ? 'Review' : 'Update'}
                                </button>
                              </td>
                            )}
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.last_service_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(item.next_service_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  item.service_status === 'Overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : item.service_status === 'Due Soon'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {item.service_status}
                              </span>
                            </td>
                            {role === 'admin' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleModalOpen('update', item)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  {viewMode === 'pending' && item.order_status === 'requested' ? 'Review' : 'Update'}
                                </button>
                              </td>
                            )}
                          </>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {inventory.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{pagination.page}</span> of{' '}
                      <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto relative"
            >
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
                        onChange={(e) => setUpdateForm(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                        className="p-2 w-full border rounded focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;