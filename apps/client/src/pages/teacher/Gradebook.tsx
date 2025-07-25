import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

const Gradebook: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isGradeEntryOpen, setIsGradeEntryOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Mock data - in a real app this would come from the API
  const classes = [
    { id: '1', name: 'Preschool - Room 101' },
    { id: '2', name: 'Kindergarten - Room 102' },
    { id: '3', name: '1st Grade - Room 103' }
  ];

  const students = [
    { id: '1', name: 'Emma Johnson', grades: [{ assignment: 'Memory Verse Test', grade: 'A', date: '2023-05-15' }] },
    { id: '2', name: 'Noah Williams', grades: [{ assignment: 'Memory Verse Test', grade: 'B+', date: '2023-05-15' }] },
    { id: '3', name: 'Olivia Brown', grades: [{ assignment: 'Memory Verse Test', grade: 'A-', date: '2023-05-15' }] },
    { id: '4', name: 'Liam Jones', grades: [{ assignment: 'Memory Verse Test', grade: 'B', date: '2023-05-15' }] }
  ];

  const handleAddGrade = (student: any) => {
    setSelectedStudent(student);
    setIsGradeEntryOpen(true);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, you would send this data to the backend
    console.log('Grade saved for student:', selectedStudent);
    setIsGradeEntryOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gradebook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="class-select" className="mb-2 block">Select Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class-select" className="w-[300px]">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Recent Grades</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {student.grades.map((grade, index) => (
                        <div key={index} className="flex items-center">
                          <span className="mr-2">{grade.assignment}:</span>
                          <span className="font-medium">{grade.grade}</span>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isGradeEntryOpen && selectedStudent?.id === student.id} onOpenChange={setIsGradeEntryOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleAddGrade(student)}>
                            <Plus className="mr-1 h-4 w-4" /> Add Grade
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Grade for {selectedStudent?.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSaveGrade} className="space-y-4">
                            <div>
                              <Label htmlFor="assignment-title">Assignment Title</Label>
                              <Input id="assignment-title" placeholder="e.g., Memory Verse Test" />
                            </div>
                            <div>
                              <Label htmlFor="grade">Grade</Label>
                              <Input id="grade" placeholder="e.g., A, B+, Excellent" />
                            </div>
                            <div>
                              <Label htmlFor="notes">Notes (Optional)</Label>
                              <Textarea id="notes" placeholder="Additional comments" />
                            </div>
                            <Button type="submit">Save Grade</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!selectedClass && (
            <div className="text-center py-10 text-gray-500">
              Please select a class to view the gradebook
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Gradebook;