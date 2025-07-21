import React, { useState } from 'react';
import { useResources, useUploadResource } from '@/hooks/useResources';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TeacherResources: React.FC = () => {
  const { resources, isLoading } = useResources();
  const uploadMutation = useUploadResource();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lesson Plan');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    uploadMutation.mutate(formData);
    setTitle('');
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Resources</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Resource</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="border rounded-md px-2 py-1"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Song">Song</option>
                <option value="Video">Video</option>
                <option value="Craft">Craft</option>
              </select>
            </div>
            <div>
              <Label htmlFor="file">File</Label>
              <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {uploadMutation.error && (
              <p className="text-sm text-red-600">{(uploadMutation.error as Error).message}</p>
            )}
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p>Loading resources...</p>}
          {resources.map((res) => (
            <div key={res._id} className="border p-2 rounded-md">
              <p className="font-medium">{res.title}</p>
              <p className="text-sm text-gray-600">{res.type} - {res.status}</p>
            </div>
          ))}
          {resources.length === 0 && !isLoading && (
            <p className="text-sm text-gray-500">No resources uploaded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherResources;
