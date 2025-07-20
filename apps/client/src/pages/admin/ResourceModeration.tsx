import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';
import { Resource } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ResourceModeration: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(['pending-resources'], async () =>
    apiClient.get<{ resources: Resource[] }>('/resources/pending')
  );

  const updateStatusMutation = useMutation(
    async ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) =>
      apiClient.put(`/resources/${id}/status`, { status }),
    {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['pending-resources'] }),
    }
  );

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  const resources = data?.resources ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resource Moderation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pending Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resources.map((resource) => (
            <div
              key={resource._id}
              className="flex items-center justify-between border p-3 rounded-md"
            >
              <div>
                <p className="font-medium">{resource.title}</p>
                <p className="text-sm text-gray-600">{resource.type}</p>
              </div>
              <div className="space-x-2">
                <Button
                  size="sm"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: resource._id,
                      status: 'Approved',
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: resource._id,
                      status: 'Rejected',
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
          {resources.length === 0 && (
            <p className="text-sm text-gray-500">No pending resources.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceModeration;
