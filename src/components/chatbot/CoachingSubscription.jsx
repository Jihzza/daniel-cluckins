// src/components/chatbot/CoachingSubscription.jsx
import React, { useState } from 'react';
import { mcpClient } from '../../services/mcpClient';

const CoachingSubscription = ({ onSubscriptionCreated, onClose }) => {
  const [formData, setFormData] = useState({
    plan: 'basic',
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const planOptions = [
    { value: 'basic', label: 'Basic Plan', price: '€40/mo', description: 'Essential coaching features' },
    { value: 'standard', label: 'Standard Plan', price: '€90/mo', description: 'Most popular choice' },
    { value: 'premium', label: 'Premium Plan', price: '€230/mo', description: 'Full access to all features' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await mcpClient.subscribeToCoaching({
        ...formData,
        userId: 'current-user-id' // This will be replaced with actual user ID
      });
      onSubscriptionCreated(result.message);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Subscribe to Coaching</h3>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm mb-2">Choose Your Plan</label>
          <div className="space-y-2">
            {planOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="plan"
                  value={option.value}
                  checked={formData.plan === option.value}
                  onChange={handleInputChange}
                  className="text-[#BFA200] focus:ring-[#BFA200]"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-white/60 text-sm">{option.description}</div>
                  <div className="text-[#BFA200] font-semibold">{option.price}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-1">Phone (optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
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
            {isSubmitting ? 'Creating...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CoachingSubscription;
