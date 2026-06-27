// useCourts Hook
import { useQuery } from '@tanstack/react-query';
import { courtRepository } from '../../../repositories';

export const useCourts = (venueId) => {
  return useQuery({
    queryKey: ['courts', venueId],
    queryFn: () => courtRepository.getCourtsByVenue(venueId),
    enabled: !!venueId,
  });
};

export default useCourts;
