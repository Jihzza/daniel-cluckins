// src/components/chatbot/AppointmentScheduler.jsx
import React, { useState } from 'react';
import { mcpClient } from '../../services/mcpClient';

const AppointmentScheduler = ({ onAppointmentScheduled, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    durationMinutes: 60,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Europe/Madrid'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await mcpClient.scheduleAppointment(formData);
      onAppointmentScheduled(result.message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Schedule Appointment</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-white/80 text-sm mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-1">Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Duration (minutes)</label>
          <select
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleInputChange}
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring focus:ring-white/30"
          >
            <option value={45}>45 minutes (€67.50)</option>
            <option value={60}>1 hour (€90.00)</option>
            <option value={75}>1.25 hours (€112.50)</option>
            <option value={90}>1.5 hours (€135.00)</option>
            <option value={105}>1.75 hours (€157.50)</option>
            <option value={120}>2 hours (€180.00)</option>
          </select>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Your Name</label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Email</label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Phone (optional)</label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleInputChange}
            placeholder="+1 234 567 8900"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-black/20 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-black/30 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#BFA200] text-black px-4 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentScheduler;
