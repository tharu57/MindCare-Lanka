import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Validation schemas
const signInSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    'Password must be at least 8 characters, with uppercase, lowercase, number, and special character'
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Spinner component
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// DatePicker component
const DatePicker = ({ value, onChange }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal',
          !value && 'text-muted-foreground'
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, 'PPP') : <span>Pick a date</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto bg-white p-0">
      <Calendar
        mode="single"
        selected={value}
        onSelect={onChange}
        initialFocus
      />
    </PopoverContent>
  </Popover>
);

// SignInForm component
const SignInForm = ({ setOpen }) => {
  const queryClient = useQueryClient();
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '' },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      console.log('Sending login data:', data);
      const response = await axios.post('http://localhost:5000/api/patients/login', {
        phone: data.phone,
        password: data.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log('Login response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Login onSuccess:', data);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('JWT Token stored:', data.token);
        try {
          const decoded = jwtDecode(data.token);
          console.log('Decoded JWT:', {
            patient_id: decoded.patient_id,
            email: decoded.email,
            full_name: decoded.full_name,
          });
          
          // Update global auth state
          login({
            id: decoded.patient_id,
            email: decoded.email,
            full_name: decoded.full_name
          });
        } catch (error) {
          console.error('Failed to decode JWT:', error);
        }
      } else {
        console.error('No token in response');
      }
      toast.success('Logged in successfully', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      form.reset();
      queryClient.invalidateQueries(['patients']);
      setOpen(false); // Close the sheet
    },
    onError: (error) => {
      console.error('Login error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
        code: error.code,
      });
      toast.error(error.response?.data?.error || 'Failed to log in', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 3000,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Fields marked with <span className="text-red-500">*</span> are required.</p>
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <PhoneInput
                  country="lk"
                  value={field.value}
                  onChange={field.onChange}
                  inputProps={{ name: 'phone', required: true, autoFocus: true }}
                  containerClass="w-full"
                  inputClass="w-full h-10 border rounded-md"
                />
              </FormControl>
              {fieldState.error && <FormMessage className="text-red-500">{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full bg-lime-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Sign In'}
        </Button>
      </div>
    </Form>
  );
};

// SignUpForm component
const SignUpForm = ({ setOpen }) => {
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      dob: null,
      phone: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('full_name', data.fullName);
      formData.append('date_of_birth', format(data.dob, 'yyyy-MM-dd'));
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      formData.append('email', data.email);
      formData.append('password', data.password); // Note: Backend should hash this

      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value;
      }
      console.log('Sending FormData:', formDataEntries);

      const response = await axios.post('http://localhost:5000/api/patients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      console.log('POST response:', {
        status: response.status,
        data: response.data,
      });
      return { ...response.data, formData: data }; // Pass form data for phone
    },
    onSuccess: (data) => {
      console.log('POST onSuccess:', data);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('JWT Token stored:', data.token);
        try {
          const decoded = jwtDecode(data.token);
          console.log('Decoded JWT:', {
            id: decoded.id,
            email: decoded.email,
            full_name: decoded.full_name,
            phone: data.formData.phone // Phone from form data
          });
        } catch (error) {
          console.error('Failed to decode JWT:', error);
        }
      } else {
        console.error('No token in response');
      }
      toast.success('Sign up successful', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      form.reset();
      queryClient.invalidateQueries(['patients']);
      setOpen(false); // Close the sheet
    },
    onError: (error) => {
      console.error('POST error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
        code: error.code,
      });
      toast.error(error.response?.data?.error || 'Failed to create patient', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 3000,
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Fields marked with <span className="text-red-500">*</span> are required.</p>
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="dob"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <DatePicker value={field.value} onChange={field.onChange} />
              </FormControl>
              {fieldState.error && <FormMessage className="text-red-500">{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="phone"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <PhoneInput
                  country="lk"
                  value={field.value}
                  onChange={field.onChange}
                  inputProps={{ name: 'phone', required: true }}
                  containerClass="w-full"
                  inputClass="w-full h-10 border rounded-md"
                />
              </FormControl>
              {fieldState.error && <FormMessage className="text-red-500">{fieldState.error.message}</FormMessage>}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Address" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm Password" {...field} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button onClick={form.handleSubmit(onSubmit)} className="w-full bg-lime-700 text-white" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : 'Sign Up'}
        </Button>
      </div>
    </Form>
  );
};

// Auth component wrapped in Sheet
export const Auth = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Sign In
        </button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] bg-white p-6 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Authentication</h2>
        <div className="bg-white rounded-lg">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="p-4">
              <SignInForm setOpen={setOpen} />
            </TabsContent>
            <TabsContent value="signup" className="p-4">
              <SignUpForm setOpen={setOpen} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};