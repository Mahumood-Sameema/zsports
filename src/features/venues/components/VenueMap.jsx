// VenueMap Component
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import Button from '../../../components/common/Button';

export const VenueMap = ({
  location = { lat: 19.0760, lng: 72.8777 },
  address = 'Mumbai, Maharashtra',
  name = 'Sports Venue'
}) => {
  const { lat, lng } = location;
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleGetDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-neutral-200 shadow-sm select-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="text-primary shrink-0" size={18} />
          <div>
            <h4 className="text-sm font-bold text-neutral-850">{name}</h4>
            <p className="text-xs text-neutral-500 line-clamp-1">{address}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<Navigation size={14} />}
          onClick={handleGetDirections}
        >
          Directions
        </Button>
      </div>

      {/* Map Iframe */}
      <div className="w-full aspect-video rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 relative">
        <iframe
          title={`Map view for ${name}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={embedUrl}
          className="filter grayscale-[10%] contrast-[110%] w-full h-full"
          loading="lazy"
        />
      </div>
      
      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block text-center mt-1">
        Latitude: {lat.toFixed(4)} &bull; Longitude: {lng.toFixed(4)}
      </span>
    </div>
  );
};

export default VenueMap;
