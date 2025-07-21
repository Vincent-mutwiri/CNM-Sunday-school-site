import React from 'react';
import { useMyChildren } from '@/hooks/useChildren';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAge } from '@/lib/utils';

const Children: React.FC = () => {
  const { children, isLoading } = useMyChildren();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Children</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && <p>Loading children...</p>}
        {children.map((child) => (
          <Card key={child._id}>
            <CardHeader>
              <CardTitle>
                {child.firstName} {child.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Age: {calculateAge(child.dateOfBirth)} years</p>
              <p className="text-sm">Class: {child.assignedClass || 'N/A'}</p>
            </CardContent>
          </Card>
        ))}
        {children.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500">No children found.</p>
        )}
      </div>
    </div>
  );
};

export default Children;
