// src/components/profile/ProfileHeader.jsx
import React from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import OctagonAvatar from '../common/OctagonAvatar';

export default function ProfileHeader({
    avatarUrl = '',
    fullName,
    phone,
    onEdit
  }) {
    const src = avatarUrl || 'https://via.placeholder.com/150';
  
    return (
      <div className="flex items-center border-b-0 p-4 space-x-4">
        <OctagonAvatar
          src={src}
          alt={`${fullName || 'User'}'s avatar`}
          size={80}        // matches w-16 / h-16
          ringWidth={3}
          gap={4}
          ringColor="#FACC15"  // Tailwind yellow-400 to match active brand highlights
          className="shrink-0"
        />
  
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-white md:text-2xl">{fullName || 'User'}</h2>
          {phone && <p className="text-sm text-white md:text-base">{phone}</p>}
        </div>
  
        <button
          onClick={onEdit}
          className="p-2 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Edit profile"
        >
          <PencilSquareIcon className="h-6 w-6 md:h-8 md:w-8" />
        </button>
      </div>
    );
  }