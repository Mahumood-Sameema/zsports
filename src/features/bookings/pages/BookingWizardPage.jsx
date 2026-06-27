// BookingWizardPage Component
import React from 'react';
import BookingWizard from '../components/BookingWizard';
import { BookingProvider } from '../context/BookingContext';

export const BookingWizardPage = () => {
  return (
    <BookingProvider>
      <div className="bg-slate-50 min-h-screen py-4">
        <BookingWizard />
      </div>
    </BookingProvider>
  );
};

export default BookingWizardPage;
