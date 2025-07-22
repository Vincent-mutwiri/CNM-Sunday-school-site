import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type EventType = 'Announcement' | 'Event' | 'Birthday' | 'Memory Verse';

interface EventFormData {
  title: string;
  type: EventType;
  description: string;
  date: Date;
}

export const CreateEventForm = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EventFormData>();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const createEvent = useCreateEvent();

  const eventType = watch('type');

  const onSubmit = async (data: EventFormData) => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    try {
      await createEvent.mutateAsync({
        ...data,
        date: date.toISOString(),
      });
      
      toast.success('Event created successfully!');
      navigate('/teacher/events');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
            placeholder="Enter event title"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type *
          </label>
          <Select
            onValueChange={(value: EventType) => setValue('type', value)}
            defaultValue={eventType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Announcement">Announcement</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Birthday">Birthday</SelectItem>
              <SelectItem value="Memory Verse">Memory Verse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(selectedDate: Date | undefined) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Enter event description (optional)"
            rows={4}
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/teacher/events')}
            disabled={createEvent.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createEvent.isPending}>
            {createEvent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
