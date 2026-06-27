// SlotCard Component
import React from 'react';
import Badge from '../../../components/common/Badge';

export const SlotCard = ({ slot, isSelected = false, onSelect = null, disabled = false }) => {
  const isBooked = slot.status === 'booked';
  const isBlocked = slot.status === 'blocked';
  const isHold = slot.status === 'on_hold';

  let borderStyle = 'border-neutral-200 bg-white hover:border-primary cursor-pointer hover:bg-slate-50/50';
  let textStyle = 'text-neutral-700';

  if (isBooked) {
    borderStyle = 'border-neutral-100 bg-neutral-50 cursor-not-allowed';
    textStyle = 'text-neutral-400';
  } else if (isBlocked) {
    borderStyle = 'border-rose-100 bg-rose-50/40 cursor-not-allowed';
    textStyle = 'text-rose-500';
  } else if (isHold) {
    borderStyle = 'border-amber-100 bg-amber-50/40 cursor-not-allowed';
    textStyle = 'text-amber-500';
  } else if (isSelected) {
    borderStyle = 'border-primary bg-primary-light/30 ring-1 ring-primary';
    textStyle = 'text-primary font-bold';
  }

  const handleClick = () => {
    if (!isBooked && !isBlocked && !isHold && !disabled && onSelect) {
      onSelect(slot);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`border rounded p-3 flex flex-col justify-between items-center transition-all duration-150 select-none h-16 ${borderStyle}`}
    >
      <span className={`text-xs font-bold ${textStyle}`}>{slot.startTime}</span>
      <span className={`text-[10px] font-semibold ${isSelected ? 'text-primary' : 'text-neutral-500'}`}>
        ₹{slot.price}
      </span>
    </div>
  );
};

export default SlotCard;
