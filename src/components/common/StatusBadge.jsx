// StatusBadge Component
import React from 'react';
import Badge from './Badge';

export const StatusBadge = ({ status, className = '' }) => {
  const mapping = {
    // Booking statuses
    confirmed: { label: 'Confirmed', variant: 'success' },
    pending: { label: 'Pending', variant: 'warning' },
    cancelled: { label: 'Cancelled', variant: 'danger' },
    completed: { label: 'Completed', variant: 'info' },
    no_show: { label: 'No Show', variant: 'neutral' },
    
    // Slot statuses
    available: { label: 'Available', variant: 'success' },
    booked: { label: 'Booked', variant: 'neutral' },
    blocked: { label: 'Blocked', variant: 'danger' },
    on_hold: { label: 'On Hold', variant: 'warning' },
    expired: { label: 'Expired', variant: 'neutral' },
  };

  const current = mapping[status?.toLowerCase()] || { label: status, variant: 'neutral' };

  return (
    <Badge variant={current.variant} className={className}>
      {current.label}
    </Badge>
  );
};

export default StatusBadge;
