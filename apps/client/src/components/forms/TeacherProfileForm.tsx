import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

const TeacherProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [qualifications, setQualifications] = useState<string[]>(user?.qualifications || []);
  const [newQualification, setNewQualification] = useState('');
  const [weeklyAvailability, setWeeklyAvailability] = useState<any>(user?.weeklyAvailability || {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });

  const timeSlots = ['Morning', 'Afternoon', 'Evening'];

  const handleAddQualification = () => {
    if (newQualification.trim() !== '') {
      setQualifications([...qualifications, newQualification.trim()]);
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const handleAvailabilityChange = (day: string, slot: string, checked: boolean) => {
    setWeeklyAvailability({
      ...weeklyAvailability,
      [day]: checked
        ? [...weeklyAvailability[day], slot]
        : weeklyAvailability[day].filter((s: string) => s !== slot)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send this data to the backend
    console.log('Profile updated:', { qualifications, weeklyAvailability });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Qualifications Section */}
          <div>
            <Label htmlFor="qualifications" className="text-lg font-medium">Qualifications</Label>
            <div className="mt-2 flex">
              <Input
                id="qualifications"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                placeholder="Add a qualification"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddQualification} className="ml-2">
                Add
              </Button>
            </div>
            <div className="mt-2 space-y-1">
              {qualifications.map((qualification, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{qualification}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveQualification(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Availability Section */}
          <div>
            <Label className="text-lg font-medium">Weekly Availability</Label>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Day</th>
                    {timeSlots.map(slot => (
                      <th key={slot} className="p-2 text-center">{slot}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(weeklyAvailability).map(day => (
                    <tr key={day}>
                      <td className="p-2 capitalize">{day}</td>
                      {timeSlots.map(slot => (
                        <td key={slot} className="p-2 text-center">
                          <Checkbox
                            checked={weeklyAvailability[day].includes(slot)}
                            onCheckedChange={(checked) => 
                              handleAvailabilityChange(day, slot, checked as boolean)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button type="submit">Save Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherProfileForm;