import React, { useState, useEffect } from 'react';
import bookingService from '../../api/bookingService';

/**
 * Service Manager Component
 * Demonstrates Booking Microservice Integration
 * 
 * Features:
 * - View all services
 * - Create new services
 * - Update/delete services
 * - Service analytics
 */
const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    deposit: '',
    category: 'haircut'
  });

  const categories = [
    { value: 'haircut', label: 'Haircut' },
    { value: 'coloring', label: 'Coloring' },
    { value: 'styling', label: 'Styling' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'nails', label: 'Nails' },
    { value: 'spa', label: 'Spa' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getMyServices();
      
      if (response.success) {
        setServices(response.data || []);
      }
    } catch (err) {
      console.error('Error loading services:', err);
      setError(err.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
        category: formData.category
      };
      
      const response = await bookingService.createService(serviceData);
      
      if (response.success) {
        setSuccess('Service created successfully!');
        setShowForm(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          duration: '',
          deposit: '',
          category: 'haircut'
        });
        loadServices(); // Reload services list
      }
    } catch (err) {
      console.error('Error creating service:', err);
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await bookingService.deleteService(serviceId);
      
      if (response.success) {
        setSuccess('Service deleted successfully!');
        loadServices();
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err.response?.data?.message || 'Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-manager p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ New Service'}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Create Service Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Create New Service</h2>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Premium Haircut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="5"
                  max="480"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit ($)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your service..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Services</h2>
        
        {loading && <div className="text-center py-4">Loading services...</div>}
        
        {!loading && services.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No services yet. Create your first service!</p>
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {service.category}
                  </span>
                </div>
                
                {service.description && (
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                )}
                
                <div className="space-y-1 text-sm mb-3">
                  <p><strong>Price:</strong> ${service.price}</p>
                  <p><strong>Duration:</strong> {service.duration} min</p>
                  {service.deposit > 0 && (
                    <p><strong>Deposit:</strong> ${service.deposit}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white text-sm py-1 px-3 rounded hover:bg-red-700 disabled:bg-gray-400 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManager;
