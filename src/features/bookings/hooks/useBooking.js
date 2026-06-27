// useBooking Hook
import { useQuery } from '@tanstack/react-query';
import { bookingRepository } from '../../../repositories';

export const useBooking = (bookingId) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingRepository.getBookingById(bookingId),
    enabled: !!bookingId,
  });
};

export default useBooking;
