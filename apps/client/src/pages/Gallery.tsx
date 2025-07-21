import React from 'react';
import { useGalleryImages } from '@/hooks/useGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Gallery: React.FC = () => {
  const { images, isLoading } = useGalleryImages();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gallery</h1>
      {isLoading && <p>Loading images...</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <Card key={img._id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{img.caption || 'Image'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <img src={img.imageUrl} alt={img.caption || 'image'} className="w-full h-48 object-cover" />
            </CardContent>
          </Card>
        ))}
        {images.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500">No images available.</p>
        )}
      </div>
    </div>
  );
};

export default Gallery;
