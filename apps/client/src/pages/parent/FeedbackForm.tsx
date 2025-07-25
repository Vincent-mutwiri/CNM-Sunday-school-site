import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';

// Mock data - in a real app this would come from the API
const mockTeachers = [
  { id: '1', name: 'Ms. Johnson' },
  { id: '2', name: 'Mr. Smith' },
  { id: '3', name: 'Mrs. Williams' }
];

const FeedbackForm: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send this to the backend
    console.log('Feedback submitted:', { selectedTeacher, rating, comments });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Teacher Feedback</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="teacher">Select Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Rating</Label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer ${
                      star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your feedback..."
                className="min-h-[150px]"
              />
            </div>
            
            <Button type="submit">Submit Feedback</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;