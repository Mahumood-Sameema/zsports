// FAQPage Component
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, ChevronDown, MessageSquare, Info, ShieldAlert, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../components/common/Button';

const FAQ_DATA = [
  {
    category: 'General Platform',
    icon: Info,
    items: [
      {
        question: 'What is ZSports Booking?',
        answer: 'ZSports is a premium booking engine that allows players to discover sports facilities (turf grounds, courts, pools) in their neighborhood, check real-time slot availability, and book immediately online.'
      },
      {
        question: 'How do I create a customer account?',
        answer: 'You can sign up in less than a minute. Click on the "Sign In" button in the navigation bar, switch to the "Register" tab, fill in your details (or log in directly using Google OAuth), and start booking!'
      },
      {
        question: 'Is ZSports available offline?',
        answer: 'While bookings are synchronized with the cloud, the platform leverages local caching. For venue operations staff, we also support walk-in bookings and cash check-in logs.'
      }
    ]
  },
  {
    category: 'Bookings & Cancellations',
    icon: CreditCard,
    items: [
      {
        question: 'How do I book a court or turf slot?',
        answer: 'Browse the venues catalog, click on any venue to view details, select a court, choose an available date, pick your desired time slots, apply any coupon codes, and proceed to book. You will receive a QR confirmation code instantly.'
      },
      {
        question: 'Can I cancel my slot and get a refund?',
        answer: 'Yes! ZSports allows bookings to be cancelled up to 4 hours before the slot begins. The cancellation policy enforces automatic refund initialization back to the original payment method, subject to the venue operator setting thresholds.'
      },
      {
        question: 'How do I redeem coupons?',
        answer: 'During the checkout step in the booking wizard, type your active coupon code (e.g. EXTRA10) in the promo box and click apply. The discount will instantly recalculate before you confirm the slot.'
      }
    ]
  },
  {
    category: 'Venue & Staff Operations',
    icon: ShieldAlert,
    items: [
      {
        question: 'How does staff verify a customer booking at the gate?',
        answer: 'Staff can log into the staff portal, click "Look Up Customer" or use the walk-in log, type the 6-character booking reference, or view the live checklist grid. They can toggle the check-in status with a single click.'
      },
      {
        question: 'What happens when a slot is blocked or overridden by staff?',
        answer: 'Venue admins and staff can override specific slots (e.g. for maintenance or private tournaments). If a slot is overridden, any active booking in that slot will be cancelled, and notifications along with refund triggers will be dispatched to the player.'
      },
      {
        question: 'How do I list my sports facility on ZSports?',
        answer: 'ZSports is currently onboarding premium venues. Please reach out to our team using the Contact Us form, select "Business Partnerships" as the subject, and an coordinator will assist with your catalog setup.'
      }
    ]
  }
];

export const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndexes, setOpenIndexes] = useState({});

  const toggleAccordion = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenIndexes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.map((cat, catIdx) => {
      const items = cat.items.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...cat, items, catIdx };
    }).filter(cat =>
      (activeCategory === 'All' || cat.category === activeCategory) && cat.items.length > 0
    );
  }, [searchQuery, activeCategory]);

  const categories = ['All', ...FAQ_DATA.map(c => c.category)];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 select-none text-neutral-600 font-normal">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="text-primary h-8 w-8" /> Frequently Asked Questions
        </h1>
        <p className="text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Find answers to common questions about venue slots, refunds, cancellations, and staff check-ins.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-6 mb-8">
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search FAQs by keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-neutral-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white shadow-xs transition-colors"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-8 min-h-[300px]">
        <AnimatePresence mode="wait">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-2">
                    <Icon size={16} className="text-primary" /> {cat.category}
                  </h2>

                  <div className="space-y-3">
                    {cat.items.map((item, itemIdx) => {
                      const isOpen = !!openIndexes[`${cat.catIdx}-${itemIdx}`];
                      return (
                        <div
                          key={itemIdx}
                          className="bg-white border border-neutral-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-neutral-300 shadow-2xs"
                        >
                          <button
                            onClick={() => toggleAccordion(cat.catIdx, itemIdx)}
                            className="w-full flex items-center justify-between p-4 text-left font-bold text-neutral-850 hover:bg-neutral-50/50 transition-colors"
                          >
                            <span className="text-sm">{item.question}</span>
                            <ChevronDown
                              size={18}
                              className={`text-neutral-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''
                                }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden bg-neutral-50/50 border-t border-neutral-100"
                              >
                                <p className="p-4 text-xs leading-relaxed text-neutral-500">
                                  {item.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 space-y-3 bg-neutral-50 rounded-xl border border-dashed border-neutral-200"
            >
              <HelpCircle className="h-10 w-10 text-neutral-400 mx-auto" />
              <h3 className="font-bold text-neutral-800">No results match your search</h3>
              <p className="text-xs text-neutral-500">Try rephrasing your search query or choosing another category.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Support Box Footer */}
      <div className="mt-16 bg-slate-900 text-white p-8 rounded-2xl text-center space-y-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between md:text-left gap-6">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-base flex items-center justify-center md:justify-start gap-2">
            <MessageSquare size={18} className="text-amber-400" /> Still have questions?
          </h3>
          <p className="text-xs text-slate-350 max-w-sm">
            Our active helpline agents can help resolve reservation issues, payment reconciliations, or dashboard configurations.
          </p>
        </div>
        <Link to="/contact" className="shrink-0">
          <Button variant="primary" size="md">Contact Support</Button>
        </Link>
      </div>
    </div>
  );
};

export default FAQPage;
