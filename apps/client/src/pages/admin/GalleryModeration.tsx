import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { GalleryImage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GalleryModeration: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['pending-images'], async () =>
    apiClient.get<{ images: GalleryImage[] }>('/gallery/pending')
  );

  const updateStatusMutation = useMutation(
    async ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) =>
      apiClient.put(`/gallery/${id}/status`, { status }),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-images'] }),
    }
  );

  if (isLoading) {
    return <div>Loading images...</div>;
  }

  const images = data?.images ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gallery Moderation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {images.map((img) => (
            <div key={img._id} className="flex items-center justify-between border p-3 rounded-md">
              <div className="flex items-center space-x-3">
                <img src={img.imageUrl} alt={img.caption || 'image'} className="h-16 w-16 object-cover rounded-md" />
                <div>
                  <p className="font-medium">{img.caption || 'No caption'}</p>
                </div>
              </div>
              <div className="space-x-2">
                <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: img._id, status: 'Approved' })}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => updateStatusMutation.mutate({ id: img._id, status: 'Rejected' })}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-gray-500">No pending images.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryModeration;
