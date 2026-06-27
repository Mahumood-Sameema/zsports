// useVenues Hook
import { useQuery } from '@tanstack/react-query';
import { venueRepository } from '../../../repositories';

export const useVenues = (filters = {}) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: () => venueRepository.getVenues(filters),
    placeholderData: (prev) => prev, // Keeps old data during debounced re-fetches
    staleTime: 1000 * 60 * 5, // 5 mins caching
  });
};

export default useVenues;
