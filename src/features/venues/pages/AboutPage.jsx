// AboutPage Component
import React from 'react';
import { Shield, Award, Users, Trophy } from 'lucide-react';
import Button from '../../../components/common/Button';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  const stats = [
    { label: 'Listed Venues', value: '150+' },
    { label: 'Weekly Bookings', value: '4,000+' },
    { label: 'Active Players', value: '10,000+' },
    { label: 'Supported Sports', value: '12' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16 select-none text-neutral-600 font-normal">
      {/* Introduction */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Our Mission</h1>
        <p className="text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          At ZSports, we believe playing sports should be as simple as booking a cab. We bridge the gap between facility operators and players, removing friction to keep our communities active, healthy, and connected.
        </p>
      </section>

      {/* Stats KPI Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs text-center space-y-1">
            <span className="block text-3xl font-extrabold text-primary">{stat.value}</span>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <h2 className="text-xl font-bold text-neutral-900 text-center uppercase tracking-wider">Core Values</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
              <Shield size={22} />
            </div>
            <h3 className="text-sm font-bold text-neutral-850">Trust & Transparency</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We ensure all slots reflect actual real-time configurations. No hidden reservation pricing or administrative double-bookings.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
              <Award size={22} />
            </div>
            <h3 className="text-sm font-bold text-neutral-850">Premium Quality</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We partner only with verified facilities. Turf layers, floodlights, safety boundaries, and hygiene are moderated regularly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
              <Users size={22} />
            </div>
            <h3 className="text-sm font-bold text-neutral-850">Community First</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              We support amateur leagues, school tournaments, and local sports clubs with custom bookings and settings.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center space-y-6">
        <Trophy size={42} className="text-amber-400 mx-auto fill-amber-400/10" />
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Ready to play?</h2>
          <p className="text-xs text-slate-350 leading-relaxed">
            Check court configurations in your neighborhood and secure your slot today.
          </p>
        </div>
        <Link to="/venues" className="inline-block">
          <Button variant="primary" size="lg">Explore Venues</Button>
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
