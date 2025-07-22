import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';

interface SettingsForm {
  siteName: string;
  siteDescription?: string;
  defaultUserRole: 'Admin' | 'Teacher' | 'Parent';
}

const AdminSettings: React.FC = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useSettings();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsForm>();

  const defaultRole = watch('defaultUserRole');

  useEffect(() => {
    if (settings) {
      setValue('siteName', settings.siteName);
      setValue('siteDescription', settings.siteDescription || '');
      setValue('defaultUserRole', settings.defaultUserRole);
    }
  }, [settings, setValue]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      await updateSettings(data);
      toast.success('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      {isLoading ? (
        <p>Loading settings...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <Input
              id="siteName"
              {...register('siteName', { required: 'Site name is required' })}
            />
            {errors.siteName && (
              <p className="text-sm text-red-600 mt-1">{errors.siteName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <Textarea id="siteDescription" {...register('siteDescription')} rows={3} />
          </div>

          <div>
            <label htmlFor="defaultUserRole" className="block text-sm font-medium text-gray-700 mb-1">
              Default User Role
            </label>
            <Select
              defaultValue={defaultRole}
              onValueChange={(value) => setValue('defaultUserRole', value as SettingsForm['defaultUserRole'])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Teacher">Teacher</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.defaultUserRole && (
              <p className="text-sm text-red-600 mt-1">{errors.defaultUserRole.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
