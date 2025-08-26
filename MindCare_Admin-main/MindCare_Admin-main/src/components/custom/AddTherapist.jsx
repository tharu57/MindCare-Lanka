import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

const AddTherapist = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();

  // Fetch treatments from API
  const { data: treatmentsData, isLoading: treatmentsLoading, error: treatmentsError } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/treatments');
      return response.data;
    },
  });

  const treatments = treatmentsData?.treatments || [];

  // Generate years array (2025 to 1970)
  const years = Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 2025 - i);

  // Available time slots from 9:00 AM to 7:00 PM
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  // Initialize React Hook Form
  const form = useForm({
    defaultValues: {
      fullName: '',
      dateOfBirth: null,
      phone: '',
      email: '',
      address: '',
      role: '',
      gender: 'Male',
      nicNumber: '',
      workStartYear: '',
      password: '',
      image: null,
      treatments: [],
      times: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const formData = new FormData();
        formData.append('full_name', data.fullName);
        formData.append('date_of_birth', data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : '');
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('address', data.address);
        formData.append('role', data.role);
        formData.append('gender', data.gender);
        formData.append('nic_number', data.nicNumber);
        formData.append('work_start_year', data.workStartYear);
        formData.append('password', data.password);
        formData.append('treatments', JSON.stringify(data.treatments)); // Send as JSON string
        formData.append('times', JSON.stringify(data.times)); // Send as JSON string
        if (data.image) {
          formData.append('image', data.image);
        }
        for (let [key, value] of formData.entries()) {
          console.log(`FormData: ${key}: ${value instanceof File ? value.name : value}`);
        }
        const response = await axios.post('http://localhost:5000/api/therapists', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          validateStatus: (status) => status >= 200 && status < 300, // Accept 2xx statuses
        });
        console.log('Raw response:', {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        });
        return response.data;
      } catch (error) {
        console.error('Axios error:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          } : null,
          request: error.request,
        });
        throw error; // Re-throw to trigger onError
      }
    },
    onSuccess: (data) => {
      console.log('onSuccess data:', data);
      if (data.message) {
        toast(data.message || 'Therapist added successfully!', {
          style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
          icon: '✅',
          duration: 3000,
        });
        form.reset();
        setImagePreview(null);
        setIsSheetOpen(false);
        queryClient.invalidateQueries(['therapists']);
      } else {
        console.error('Backend returned success: false:', data.error);
        toast.error(data.error || 'Failed to add therapist', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      console.error('onError:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : null,
        request: error.request,
      });
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add therapist';
      toast.error(errorMessage, {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  const handleImageChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      // Validate image type
      if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
        toast.error('Invalid image type. Use PNG, JPG, or GIF.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        return;
      }
      // Validate image size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        return;
      }
      field.onChange(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      field.onChange(null);
      setImagePreview(null);
    }
  };

  const onSubmit = (data) => {
    console.log('Submitting data:', data);
    mutation.mutate(data);
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Therapist
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto max-h-screen px-10 pb-4">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">Add New Therapist</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              rules={{ required: 'Full name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.fullName && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.fullName.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              rules={{ required: 'Date of birth is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.dateOfBirth && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.dateOfBirth.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              rules={{ required: 'Phone number is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={'lk'}
                      value={field.value}
                      onChange={(value) => {
                        console.log('PhoneInput changed:', value);
                        field.onChange(value);
                      }}
                      inputClass="border-gray-300 w-full"
                      containerClass="w-full"
                      buttonClass="border-gray-300"
                      placeholder="Enter phone number"
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.phone && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.phone.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.email && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.email.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              rules={{ required: 'Address is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.address && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.address.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              rules={{ required: 'Role is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="Therapist">Therapist</SelectItem>
                      <SelectItem value="Counselor">Counselor</SelectItem>
                      <SelectItem value="Psychologist">Psychologist</SelectItem>
                      <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.role && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.role.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Gender */}
            <FormField
              control={form.control}
              name="gender"
              rules={{ required: 'Gender is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={field.value === 'Male'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'Male' : 'Female')}
                        className="data-[state=checked]:bg-slate-900"
                      />
                      <span className="text-sm text-gray-600">
                        {field.value === 'Male' ? 'Male' : 'Female'}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.gender && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.gender.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* NIC Number */}
            <FormField
              control={form.control}
              name="nicNumber"
              rules={{
                required: 'NIC number is required',
                pattern: {
                  value: /^[0-9]{9}[vVxX]|[0-9]{12}$/,
                  message: 'Invalid NIC number (e.g., 123456789V or 123456789012)',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIC Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter NIC number" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.nicNumber && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.nicNumber.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Work Start Year */}
            <FormField
              control={form.control}
              name="workStartYear"
              rules={{ required: 'Work start year is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Start Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white max-h-60 overflow-y-auto">
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.workStartYear && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.workStartYear.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.password && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.password.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Treatments */}
            <FormField
              control={form.control}
              name="treatments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Treatments</FormLabel>
                  <FormControl>
                    <div className="space-y-3 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {treatmentsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm text-gray-600">Loading treatments...</span>
                        </div>
                      ) : treatmentsError ? (
                        <div className="flex items-center justify-center py-4">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-600">Failed to load treatments</span>
                        </div>
                      ) : treatments.length === 0 ? (
                        <div className="flex items-center justify-center py-4">
                          <span className="text-sm text-gray-600">No treatments available</span>
                        </div>
                      ) : (
                        treatments.map((treatment) => (
                          <div key={treatment.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={`treatment-${treatment.id}`}
                              checked={field.value.includes(treatment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, treatment.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== treatment.id));
                                }
                              }}
                              className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                            />
                            <label
                              htmlFor={`treatment-${treatment.id}`}
                              className="text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {treatment.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.treatments && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.treatments.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Available Times */}
            <FormField
              control={form.control}
              name="times"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Times (9:00 AM - 7:00 PM)</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {timeSlots.map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox
                            id={`time-${time}`}
                            checked={field.value.includes(time)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, time]);
                              } else {
                                field.onChange(field.value.filter(t => t !== time));
                              }
                            }}
                            className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                          />
                          <label
                            htmlFor={`time-${time}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.times && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.times.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="h-24 w-24 object-cover rounded-md border border-gray-300"
                          />
                        ) : (
                          <div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center border border-gray-300">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-gray-300"
                          onClick={() => document.getElementById('image-upload').click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/gif"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, field)}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-600">
                    {form.formState.errors.image && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.image.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Therapist'
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddTherapist;