import React, { useState } from 'react';
import { useUploadGalleryImage } from '@/hooks/useGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const GalleryUpload: React.FC = () => {
  const uploadMutation = useUploadGalleryImage();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    uploadMutation.mutate(formData);
    setCaption('');
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upload Gallery Image</h1>

      <Card>
        <CardHeader>
          <CardTitle>New Image</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="image">Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
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
    </div>
  );
};

export default GalleryUpload;
