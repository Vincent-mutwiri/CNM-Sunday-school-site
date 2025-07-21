import React, { useState } from 'react';
import { useResources } from '@/hooks/useResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const ResourceLibrary: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('');
  const { resources, isLoading } = useResources({ type: typeFilter || undefined });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resources</h1>

      <div className="flex items-center space-x-2">
        <Label htmlFor="type">Filter by type</Label>
        <select
          id="type"
          className="border rounded-md px-2 py-1"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Lesson Plan">Lesson Plan</option>
          <option value="Song">Song</option>
          <option value="Video">Video</option>
          <option value="Craft">Craft</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p>Loading resources...</p>}
          {resources.map((res) => (
            <div key={res._id} className="border p-2 rounded-md">
              <p className="font-medium">{res.title}</p>
              <p className="text-sm text-gray-600">{res.type}</p>
              <a
                href={res.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm"
              >
                Download
              </a>
            </div>
          ))}
          {resources.length === 0 && !isLoading && (
            <p className="text-sm text-gray-500">No resources found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceLibrary;
