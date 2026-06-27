// SportBadge Component
import React from 'react';
import { 
  Dribbble, Target, Trophy, Award, Activity 
} from 'lucide-react';

export const SportBadge = ({ sport, className = '' }) => {
  const config = {
    'football turf': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Dribbble },
    'futsal': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Dribbble },
    'cricket turf': { bg: 'bg-green-50 text-green-700 border-green-100', icon: Target },
    'cricket nets': { bg: 'bg-green-50 text-green-700 border-green-100', icon: Target },
    'badminton': { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: Trophy },
    'tennis': { bg: 'bg-lime-50 text-lime-750 border-lime-200', icon: Award },
    'squash': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: Activity },
    'swimming': { bg: 'bg-sky-50 text-sky-700 border-sky-100', icon: Activity },
    'basketball': { bg: 'bg-orange-50 text-orange-700 border-orange-100', icon: Dribbble },
    'volleyball': { bg: 'bg-blue-50 text-blue-700 border-blue-100', icon: Dribbble },
  };

  const key = sport?.toLowerCase();
  const current = config[key] || { bg: 'bg-neutral-50 text-neutral-600 border-neutral-100', icon: Activity };
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${className}`}>
      <Icon size={12} className="shrink-0" />
      <span>{sport}</span>
    </span>
  );
};

export default SportBadge;
