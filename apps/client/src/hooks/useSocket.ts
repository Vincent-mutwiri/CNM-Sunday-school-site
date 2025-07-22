import { useEffect } from 'react';
import { socket } from '@/utils/socket';
import { toast } from 'sonner';

export const useSocket = () => {
  useEffect(() => {
    const handleAnnouncement = (event: any) => {
      const title = event?.title ?? 'New announcement';
      toast.info(title);
    };

    socket.on('new_announcement', handleAnnouncement);

    return () => {
      socket.off('new_announcement', handleAnnouncement);
    };
  }, []);
};
