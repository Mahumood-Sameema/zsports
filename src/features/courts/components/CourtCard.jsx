// CourtCard Component
import React from 'react';
import { Landmark, Users, Hammer, Edit2, Trash2 } from 'lucide-react';
import SportBadge from '../../venues/components/SportBadge';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

export const CourtCard = ({
  court,
  isAdmin = false,
  onEdit = null,
  onDelete = null,
  onToggleMaintenance = null,
  onSelect = null,
  isSelected = false,
}) => {
  const isMaint = court.isUnderMaintenance;

  return (
    <div 
      className={`bg-white rounded-lg border overflow-hidden flex flex-col justify-between transition-all select-none ${
        isSelected 
          ? 'border-primary ring-2 ring-primary-light' 
          : isMaint 
            ? 'border-neutral-200 opacity-75' 
            : 'border-neutral-200 shadow-sm hover:shadow'
      }`}
    >
      {/* Detail Area */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <SportBadge sport={court.sport} />
              {isMaint && (
                <Badge variant="danger" className="uppercase tracking-wider text-[9px] font-bold">
                  Maintenance
                </Badge>
              )}
            </div>
            <h4 className="text-sm font-bold text-neutral-850">{court.name}</h4>
            {court.venueName && (
              <p className="text-[10px] text-neutral-500 font-semibold mt-1">
                Venue: <span className="text-neutral-700 font-bold">{court.venueName}</span>
              </p>
            )}
            <p className="text-[10px] text-neutral-500 font-semibold mt-0.5">
              Status: <span className={court.isActive && !isMaint ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{isMaint ? "Maintenance" : court.isActive ? "Active" : "Inactive"}</span>
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 block font-semibold uppercase tracking-wider">Base Rate</span>
            <span className="text-sm font-extrabold text-neutral-900">₹{court.baseHourlyRate}<span className="text-[10px] font-normal text-neutral-500">/hr</span></span>
          </div>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
          {court.description || 'No description provided for this court.'}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 pt-2">
          <div className="flex items-center gap-1">
            <Landmark size={14} className="text-neutral-400 shrink-0" />
            <span>{court.surfaceType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} className="text-neutral-400 shrink-0" />
            <span>Max {court.capacity} players</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-neutral-100 flex items-center justify-between gap-2">
        {isAdmin ? (
          <div className="flex items-center justify-between w-full">
            {/* Maintenance Toggle */}
            <Button
              variant={isMaint ? 'danger' : 'outline'}
              size="sm"
              leftIcon={<Hammer size={14} />}
              onClick={() => onToggleMaintenance && onToggleMaintenance(court.id, !isMaint)}
              className="!text-xs"
            >
              {isMaint ? 'Resume' : 'Maint.'}
            </Button>
            
            {/* Edit / Delete */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit && onEdit(court.id)}
                className="!p-1.5"
                aria-label="Edit Court"
              >
                <Edit2 size={13} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete && onDelete(court.id)}
                className="!p-1.5 !text-accent-red border-red-100 hover:bg-red-50"
                aria-label="Delete Court"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant={isSelected ? 'primary' : 'outline'}
            size="sm"
            disabled={isMaint}
            onClick={() => onSelect && onSelect(court)}
            fullWidth
          >
            {isSelected ? 'Selected' : 'Select Court'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CourtCard;
