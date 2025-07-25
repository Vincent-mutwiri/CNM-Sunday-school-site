import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Share2 } from 'lucide-react';

const LessonPlanner: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Mock teachers data - in a real app this would come from the API
  const teachers = [
    { id: '1', name: 'Ms. Johnson' },
    { id: '2', name: 'Mr. Smith' },
    { id: '3', name: 'Mrs. Williams' }
  ];

  const handleSave = () => {
    // In a real implementation, you would send this data to the backend
    console.log('Lesson saved:', { title, content, isShared, sharedWith });
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  const handleShareSave = () => {
    // In a real implementation, you would send this data to the backend
    console.log('Sharing settings updated:', { isShared, sharedWith });
    setIsShareDialogOpen(false);
  };

  const handleTeacherToggle = (teacherId: string, checked: boolean) => {
    if (checked) {
      setSharedWith([...sharedWith, teacherId]);
    } else {
      setSharedWith(sharedWith.filter(id => id !== teacherId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Lesson Planner</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Lesson Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <Label htmlFor="content">Lesson Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your lesson plan content here..."
              className="min-h-[300px]"
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Lesson Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="share-all"
                checked={isShared}
                onCheckedChange={(checked) => setIsShared(checked as boolean)}
              />
              <Label htmlFor="share-all">Share with all teachers</Label>
            </div>

            <div>
              <Label>Or share with specific teachers:</Label>
              <div className="mt-2 space-y-2">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`teacher-${teacher.id}`}
                      checked={sharedWith.includes(teacher.id)}
                      onCheckedChange={(checked) => handleTeacherToggle(teacher.id, checked as boolean)}
                    />
                    <Label htmlFor={`teacher-${teacher.id}`}>{teacher.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareSave}>
                Save Sharing Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonPlanner;