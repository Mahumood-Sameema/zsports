// useSlots Hook
import { useQuery } from '@tanstack/react-query';
import { slotRepository } from '../../../repositories';

export const useSlots = (courtId, dateStr) => {
  return useQuery({
    queryKey: ['court-slots', courtId, dateStr],
    queryFn: () => slotRepository.getAvailableSlots(courtId, dateStr),
    enabled: !!courtId && !!dateStr,
    refetchInterval: 1000 * 30, // Poll slots every 30 seconds for quick update bounds!
  });
};

export default useSlots;
