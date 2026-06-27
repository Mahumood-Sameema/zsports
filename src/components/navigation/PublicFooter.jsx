// PublicFooter Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export const PublicFooter = () => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 select-none">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Intro column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Trophy size={16} className="fill-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">ZSports</span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed">
              ZSports is the ultimate venue booking platform for sports enthusiasts. Discover facilities, check real-time availability, and book courts with ease.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram size={16} /></a>
            </div>
          </div>

          {/* Explore column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/venues" className="hover:text-white transition-colors">Browse Venues</Link></li>
              <li><Link to="/venues?sport=Cricket" className="hover:text-white transition-colors">Cricket Nets</Link></li>
              <li><Link to="/venues?sport=Football" className="hover:text-white transition-colors">Football Turfs</Link></li>
              <li><Link to="/venues?sport=Badminton" className="hover:text-white transition-colors">Badminton Courts</Link></li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="text-neutral-400">Lower Parel, Mumbai, MH, 400013</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                <span className="text-neutral-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary shrink-0" />
                <span className="text-neutral-400">support@zsports.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom divider and info */}
        <hr className="my-8 border-neutral-800" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} ZSports Booking. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400">Terms of Service</a>
            <a href="#" className="hover:text-neutral-400">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
