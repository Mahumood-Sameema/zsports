// useVenueDetail Hook
import { useQuery } from '@tanstack/react-query';
import { venueRepository, courtRepository, reviewRepository } from '../../../repositories';

export const useVenueDetail = (venueId) => {
  const venueQuery = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => venueRepository.getVenueById(venueId),
    enabled: !!venueId,
  });

  const courtsQuery = useQuery({
    queryKey: ['venue-courts', venueId],
    queryFn: () => courtRepository.getCourtsByVenue(venueId),
    enabled: !!venueId,
  });

  const reviewsQuery = useQuery({
    queryKey: ['venue-reviews', venueId],
    queryFn: () => reviewRepository.getReviewsByVenue(venueId),
    enabled: !!venueId,
  });

  const isLoading = venueQuery.isLoading || courtsQuery.isLoading || reviewsQuery.isLoading;
  const isError = venueQuery.isError || courtsQuery.isError || reviewsQuery.isError;

  return {
    venue: venueQuery.data || null,
    courts: courtsQuery.data || [],
    reviews: reviewsQuery.data || [],
    isLoading,
    isError,
    refetch: () => {
      venueQuery.refetch();
      courtsQuery.refetch();
      reviewsQuery.refetch();
    }
  };
};

export default useVenueDetail;
