// useBookings Hook
import { useQuery } from '@tanstack/react-query';
import { bookingRepository } from '../../../repositories';

export const useBookings = (targetId, role = 'customer', filters = {}) => {
  const queryKey = ['bookings', role, targetId, filters];
  
  const queryFn = () => {
    if (role === 'admin') {
      return bookingRepository.getBookingsByVenue(targetId, filters);
    }
    return bookingRepository.getBookingsByCustomer(targetId, filters);
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!targetId,
    staleTime: 1000 * 60 * 2, // 2 mins caching
  });
};

export default useBookings;
