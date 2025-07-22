import React, { useState } from 'react';
import { useMyChildren } from '@/hooks/useChildren';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Textarea will be used when the component is ready
import { format } from 'date-fns';
import { Pen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { calculateAge } from '@/lib/utils';

type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies: string;
  specialNotes: string;
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  allergies: '',
  specialNotes: '',
};

const Children: React.FC = () => {
  const { 
    children, 
    isLoading, 
    createChild, 
    updateChild, 
    isCreating, 
    isUpdating 
  } = useMyChildren();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (child: any) => {
    setEditingId(child._id);
    setFormData({
      firstName: child.firstName,
      lastName: child.lastName,
      dateOfBirth: format(new Date(child.dateOfBirth), 'yyyy-MM-dd'),
      allergies: child.allergies || '',
      specialNotes: child.specialNotes || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateChild({ id: editingId, data: formData });
        toast.success('Child updated successfully');
        setEditingId(null);
      } else {
        await createChild(formData);
        toast.success('Child added successfully');
        setIsAdding(false);
      }
      setFormData(initialFormData);
    } catch (error) {
      toast.error('Failed to save child');
      console.error('Error saving child:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Children</h1>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Child
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Child' : 'Add New Child'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (optional)</Label>
                  <Input
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialNotes">Special Notes (optional)</Label>
                <textarea
                  id="specialNotes"
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Saving...' : 'Save'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && <p>Loading children...</p>}
        {!isLoading && children.length === 0 && (
          <p>No children found. Add a child to get started.</p>
        )}
        {children.map((child) => (
          <Card key={child._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">
                  {child.firstName} {child.lastName}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(child)}
                  className="h-8 w-8"
                >
                  <Pen className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Age: {calculateAge(child.dateOfBirth)} years</p>
              <p className="text-sm">Class: {typeof child.assignedClass === 'string' ? child.assignedClass : child.assignedClass?.name || 'N/A'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Children;
