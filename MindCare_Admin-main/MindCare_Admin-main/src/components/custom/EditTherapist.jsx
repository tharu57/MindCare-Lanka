import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CalendarIcon, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';

// Deep comparison to detect changes
const hasChanges = (current, initial) => {
  const keys = Object.keys(current);
  for (const key of keys) {
    if (key === 'dateOfBirth') {
      if (current[key] && initial[key]) {
        if (format(current[key], 'yyyy-MM-dd') !== format(initial[key], 'yyyy-MM-dd')) {
          return true;
        }
      } else if (current[key] !== initial[key]) {
        return true;
      }
    } else if (key === 'image') {
      if (current[key] !== initial[key]) {
        return true;
      }
    } else if (key === 'treatments' || key === 'times') {
      // Compare arrays (sorted)
      if (JSON.stringify((current[key] || []).slice().sort()) !== JSON.stringify((initial[key] || []).slice().sort())) {
        return true;
      }
    } else if (current[key] !== initial[key]) {
      return true;
    }
  }
  return false;
};

const EditTherapist = ({ therapist, open, onOpenChange }) => {
  const queryClient = useQueryClient();

  // Fetch treatments from API
  const {
    data: treatmentsData,
    isLoading: treatmentsLoading,
    error: treatmentsError,
  } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/treatments');
      return response.data;
    },
  });

  const treatments = treatmentsData?.treatments || [];

  // Available time slots from 9:00 AM to 7:00 PM
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM',
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
      nic_number: '',
      work_start_year: '',
      image: null,
      treatments: [],
      times: [],
    },
  });

  // State for image preview, initial values, and changed fields
  const [imagePreview, setImagePreview] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [changedFields, setChangedFields] = useState({});

  // Parse and normalize DB data for form's initial values and pre-select checkboxes
  useEffect(() => {
    if (therapist && open) {
      // Parse date_of_birth from format like: "Tue, 05 Aug 2025 20:00:14 GMT"
      const parsedDate = therapist.date_of_birth
        ? parse(therapist.date_of_birth, "EEE, dd MMM yyyy HH:mm:ss 'GMT'", new Date())
        : null;

      let therapistTreatments = [];
      let therapistTimes = [];

      try {
        // Parse treatments field, normalize to number array
        if (therapist.treatments) {
          if (typeof therapist.treatments === 'string') {
            try {
              const parsed = JSON.parse(therapist.treatments);
              if (Array.isArray(parsed)) {
                therapistTreatments = parsed.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
              } else {
                // fallback comma separated
                therapistTreatments = therapist.treatments
                  .split(',')
                  .map((t) => parseInt(t.trim(), 10))
                  .filter((id) => !isNaN(id));
              }
            } catch {
              therapistTreatments = therapist.treatments
                .split(',')
                .map((t) => parseInt(t.trim(), 10))
                .filter((id) => !isNaN(id));
            }
          } else if (Array.isArray(therapist.treatments)) {
            therapistTreatments = therapist.treatments.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
          }
        }
      } catch (error) {
        console.error('Error parsing treatments:', error);
        therapistTreatments = [];
      }

      try {
        // Parse service_times field and normalize to your timeSlots format
        if (therapist.service_times) {
          if (typeof therapist.service_times === 'string') {
            let timesArray = [];
            try {
              const parsed = JSON.parse(therapist.service_times);
              if (Array.isArray(parsed)) {
                timesArray = parsed;
              } else {
                timesArray = therapist.service_times.split(',').map((t) => t.trim());
              }
            } catch {
              timesArray = therapist.service_times.split(',').map((t) => t.trim());
            }

            // Normalize times like "10.00.am" to "10:00 AM"
            therapistTimes = timesArray
              .map((timeStr) => {
                let t = timeStr.toLowerCase().replace(/\./g, ':').replace(/\s+/g, '');
                t = t.replace(/am$/, ' AM').replace(/pm$/, ' PM');
                if (!t.includes(' AM') && !t.includes(' PM')) {
                  if (t.endsWith('am')) t = t.replace('am', ' AM');
                  else if (t.endsWith('pm')) t = t.replace('pm', ' PM');
                }
                return t.trim();
              })
              .filter((t) => timeSlots.includes(t));
          } else if (Array.isArray(therapist.service_times)) {
            therapistTimes = therapist.service_times.filter((t) => timeSlots.includes(t));
          }
        }
      } catch (error) {
        console.error('Error parsing service_times:', error);
        therapistTimes = [];
      }

      // Set up default values for the form
      const defaultValues = {
        fullName: therapist.full_name || therapist.name || '',
        dateOfBirth: isValid(parsedDate) ? parsedDate : null,
        phone: therapist.phone || '',
        email: therapist.email || '',
        address: therapist.address || '',
        role: therapist.role || '',
        gender: therapist.gender || 'Male',
        nic_number: therapist.nic_number || '',
        work_start_year: therapist.work_start_year ? therapist.work_start_year.toString() : '',
        image: null,
        treatments: therapistTreatments,
        times: therapistTimes,
      };

      form.reset(defaultValues);

      // Build full image url if available
      setImagePreview(
        therapist.image_path ? `http://localhost:5000/${therapist.image_path}` : null
      );
      setInitialValues(defaultValues);
      setChangedFields({});
    }
  }, [therapist, open, form, treatments]);

  // Mutation for updating therapist
  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      if (data.fullName) formData.append('full_name', data.fullName);
      if (data.dateOfBirth && isValid(data.dateOfBirth)) {
        formData.append('date_of_birth', format(data.dateOfBirth, 'yyyy-MM-dd'));
      }
      if (data.phone) formData.append('phone', data.phone);
      if (data.email) formData.append('email', data.email);
      if (data.address) formData.append('address', data.address);
      if (data.role) formData.append('role', data.role);
      if (data.gender) formData.append('gender', data.gender);
      if (data.nic_number) formData.append('nic_number', data.nic_number);
      if (data.work_start_year) formData.append('work_start_year', data.work_start_year);
      if (data.image) formData.append('image', data.image);

      formData.append('treatments', JSON.stringify(data.treatments || []));
      formData.append('times', JSON.stringify(data.times || []));

      const response = await axios.put(`http://localhost:5000/api/therapists/${therapist.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        validateStatus: (status) => status >= 200 && status < 300,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Therapist updated successfully', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      queryClient.invalidateQueries(['therapists']);
      setInitialValues(form.getValues());
      setChangedFields({});
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to update therapist';

      toast.error(errorMessage, {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  // Handle field changes (onBlur)
  const handleFieldChange = (fieldName, value) => {
    setChangedFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle form click to trigger update
  const handleFormClick = () => {
    if (therapist && open && hasChanges(form.getValues(), initialValues)) {
      const formattedData = {
        ...form.getValues(),
        dateOfBirth:
          form.getValues().dateOfBirth && isValid(form.getValues().dateOfBirth)
            ? form.getValues().dateOfBirth
            : null,
        image: form.getValues().image || null,
      };
      mutation.mutate(formattedData);
    }
  };

  // Handle image file selection
  const handleImageChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
        toast.error('Invalid image type. Use PNG, JPG, or GIF.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        return;
      }
      field.onChange(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      handleFieldChange('image', file);
    } else {
      field.onChange(null);
      setImagePreview(therapist?.image_path ? `http://localhost:5000/${therapist.image_path}` : null);
      handleFieldChange('image', null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full bg-white px-10 pb-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">Edit Therapist</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-6 mt-6" onClick={handleFormClick}>
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              rules={{ required: 'Full name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      className="border-gray-300"
                      onBlur={() => handleFieldChange('fullName', field.value)}
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
              rules={{
                required: 'Date of birth is required',
                validate: (value) => isValid(value) || 'Invalid date of birth',
              }}
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
                          {field.value && isValid(field.value) ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto bg-white p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (isValid(date)) {
                            field.onChange(date);
                            handleFieldChange('dateOfBirth', date);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                      onChange={field.onChange}
                      onBlur={() => handleFieldChange('phone', field.value)}
                      inputClass="border-gray-300 w-full"
                      containerClass="w-full"
                      buttonClass="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                    <Input
                      placeholder="Enter email"
                      type="email"
                      {...field}
                      className="border-gray-300"
                      onBlur={() => handleFieldChange('email', field.value)}
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                    <Input
                      placeholder="Enter address"
                      {...field}
                      className="border-gray-300"
                      onBlur={() => handleFieldChange('address', field.value)}
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange('role', value);
                    }}
                    defaultValue={field.value}
                  >
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
                      <SelectItem value="Senior Therapist">Senior Therapist</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={field.value === 'Female'}
                        onCheckedChange={(checked) => {
                          const value = checked ? 'Female' : 'Male';
                          field.onChange(value);
                          handleFieldChange('gender', value);
                        }}
                        className="data-[state=checked]:bg-slate-900"
                      />
                      <span className="text-sm text-gray-600">
                        {field.value === 'Female' ? 'Female' : 'Male'}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
              name="nic_number"
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
                    <Input
                      placeholder="Enter NIC number"
                      {...field}
                      className="border-gray-300"
                      onBlur={() => handleFieldChange('nic_number', field.value)}
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
                    {form.formState.errors.nic_number && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.nic_number.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Work Start Year */}
            <FormField
              control={form.control}
              name="work_start_year"
              rules={{
                required: 'Work start year is required',
                pattern: {
                  value: /^\d{4}$/,
                  message: 'Enter a valid 4-digit year',
                },
                validate: (value) => parseInt(value) <= 2025 || 'Work start year cannot be in the future',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Start Year</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter work start year"
                      {...field}
                      className="border-gray-300"
                      onBlur={() => handleFieldChange('work_start_year', field.value)}
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
                    {form.formState.errors.work_start_year && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.work_start_year.message}
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
                        treatments.map((treatment) => {
                          const treatmentId = parseInt(treatment.id, 10);
                          const isChecked = field.value.some((id) => parseInt(id, 10) === treatmentId);

                          return (
                            <div key={treatment.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`treatment-${treatment.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...field.value, treatmentId]
                                    : field.value.filter((id) => parseInt(id, 10) !== treatmentId);
                                  field.onChange(newValue);
                                  handleFieldChange('treatments', newValue);
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
                          );
                        })
                      )}
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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
                      {timeSlots.map((time) => {
                        const isChecked = field.value.includes(time);

                        return (
                          <div key={time} className="flex items-center space-x-2">
                            <Checkbox
                              id={`time-${time}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, time]
                                  : field.value.filter((t) => t !== time);
                                field.onChange(newValue);
                                handleFieldChange('times', newValue);
                              }}
                              className="data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                            />
                            <label htmlFor={`time-${time}`} className="text-sm text-gray-700 cursor-pointer">
                              {time}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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

            {/* Image (Optional) */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Selected preview"
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
                          onClick={() => document.getElementById('image-upload-edit').click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                        <Input
                          id="image-upload-edit"
                          type="file"
                          accept="image/png, image/jpeg, image/gif"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, field)}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
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

            {/* Loading indicator when updating */}
            {mutation.isPending && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Updating therapist...</span>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditTherapist;
