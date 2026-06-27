// ContactPage Component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, CheckCircle, Send, ArrowRight } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

const contactSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  phone: zod.string().refine(val => !val || /^\d{10}$/.test(val), 'Phone number must be exactly 10 digits').optional(),
  subject: zod.string().min(5, 'Subject must be at least 5 characters'),
  message: zod.string().min(10, 'Message must be at least 10 characters'),
});

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' }
  });

  const onSubmit = async (data) => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const randomRef = 'ZS-' + Math.floor(100000 + Math.random() * 900000);
    setTicketRef(randomRef);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 select-none text-neutral-600 font-normal">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Contact Us</h1>
        <p className="text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
          Have questions about a venue, court configuration, or reservations? Send us a message and our support team will help you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2">
              Our Offices
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-850">Headquarters</h4>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    102 Active Arena Way, Sports Hub Phase 2, Mumbai, MH 400011
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-850">Phone Support</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    +91 (22) 5556-9102
                  </p>
                  <p className="text-2xs text-neutral-400">Mon-Sat (8:00 AM - 8:00 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-850">Email Support</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    support@zsports.com
                  </p>
                  <p className="text-2xs text-neutral-400">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary to-blue-700 text-white p-6 rounded-xl space-y-4 shadow-sm">
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <Clock size={20} className="text-white" />
            </div>
            <h3 className="font-bold text-base">Booking Operations</h3>
            <p className="text-xs text-blue-100 leading-relaxed">
              Online booking platforms operate 24/7/365. For venue cancellations, slots can be cancelled up to 4 hours before the game start time. Check full terms in your settings.
            </p>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="contact-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="p-6 md:p-8 space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-neutral-900">Inquiry Form</h2>
                  <p className="text-xs text-neutral-400">Fill in details below. All fields except phone are required.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      type="text"
                      placeholder="e.g. Sameer Shah"
                      error={errors.name}
                      {...register('name')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="e.g. sameer@example.com"
                      error={errors.email}
                      {...register('email')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number (Optional)"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      error={errors.phone}
                      {...register('phone')}
                    />

                    <Input
                      label="Subject"
                      type="text"
                      placeholder="e.g. Bulk slot booking inquiries"
                      error={errors.subject}
                      {...register('subject')}
                    />
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Message
                    </label>
                    <textarea
                      placeholder="Write your detailed query here..."
                      rows={5}
                      className={`block w-full rounded border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                        errors.message 
                          ? 'border-accent-red focus:ring-accent-red focus:border-accent-red' 
                          : 'border-neutral-200 focus:ring-primary focus:border-primary'
                      }`}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-accent-red font-medium">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    leftIcon={<Send size={16} />}
                    fullWidth
                  >
                    Send Message
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-6"
              >
                <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs">
                  <CheckCircle size={36} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">Message Received!</h3>
                  <p className="text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. We have registered your ticket and a member of our support team will contact you shortly.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-lg text-xs font-semibold text-neutral-600 max-w-xs w-full">
                  Ticket Reference: <span className="text-primary font-mono text-sm block mt-1">{ticketRef}</span>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Submit Another Ticket
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
