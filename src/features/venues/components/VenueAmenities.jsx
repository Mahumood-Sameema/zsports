// VenueAmenities Component
import React from 'react';
import { 
  Wifi, Car, Coffee, Users, Sun, CheckCircle2 
} from 'lucide-react';

export const VenueAmenities = ({ amenities = [] }) => {
  const config = {
    'wifi': { label: 'Free WiFi', icon: Wifi },
    'parking': { label: 'Parking Space', icon: Car },
    'cafeteria': { label: 'On-site Cafe', icon: Coffee },
    'restrooms': { label: 'Restrooms', icon: Users },
    'changing rooms': { label: 'Changing Rooms', icon: Users },
    'floodlights': { label: 'Floodlights', icon: Sun },
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amenities.map((item, idx) => {
        const key = item.toLowerCase().trim();
        const matched = config[key] || { label: item, icon: CheckCircle2 };
        const Icon = matched.icon;

        return (
          <div 
            key={idx} 
            className="flex items-center gap-2.5 p-3 rounded-lg border border-neutral-250 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all select-none"
          >
            <Icon className="text-primary shrink-0" size={16} />
            <span className="text-xs font-semibold text-neutral-700">{matched.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default VenueAmenities;
