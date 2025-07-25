import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar } from 'lucide-react';

// Mock data - in a real app this would come from the API
const mockVolunteerSlots = [
  {
    id: '1',
    event: 'Summer Picnic',
    title: 'Food Preparation',
    slotsAvailable: 3,
    date: '2023-07-15'
  },
  {
    id: '2',
    event: 'Back to School',
    title: 'Classroom Setup',
    slotsAvailable: 5,
    date: '2023-08-20'
  },
  {
    id: '3',
    event: 'Holiday Festival',
    title: 'Decoration Helper',
    slotsAvailable: 2,
    date: '2023-12-10'
  }
];

const VolunteerSlotCard: React.FC<{ slot: any }> = ({ slot }) => {
  const handleSignUp = () => {
    // In a real implementation, you would send this to the backend
    console.log('Signed up for volunteer slot:', slot.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-blue-500" />
          {slot.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><span className="font-medium">Event:</span> {slot.event}</p>
          <p className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            {new Date(slot.date).toLocaleDateString()}
          </p>
          <p><span className="font-medium">Slots Available:</span> {slot.slotsAvailable}</p>
        </div>
        <Button 
          className="w-full mt-4" 
          disabled={slot.slotsAvailable === 0}
          onClick={handleSignUp}
        >
          {slot.slotsAvailable > 0 ? 'Sign Up' : 'Full'}
        </Button>
      </CardContent>
    </Card>
  );
};

const VolunteerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVolunteerSlots.map(slot => (
          <VolunteerSlotCard key={slot.id} slot={slot} />
        ))}
      </div>
      
      {mockVolunteerSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No Volunteer Opportunities</h3>
            <p className="mt-1 text-gray-500">Check back later for volunteer opportunities.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VolunteerPage;