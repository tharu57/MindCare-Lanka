import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

import { setAuthToken, isAuthenticated } from '@/utils/auth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = (data) => {
    if (data.password === '123') { // Replace with your actual password validation
      setAuthToken('admin-logged-in'); // Set a token in localStorage
      toast.success('Login successful!', {
        style: { background: '#1f2937', color: '#10b981', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      // Redirect to admin dashboard
      window.location.href = '/';
    } else {
      toast.error('Incorrect password.', {
        style: { background: '#1f2937', color: '#ef4444', fontWeight: 'bold' },
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // If already authenticated, don't show login page
  if (isAuthenticated()) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <Card className="w-full max-w-md shadow-2xl bg-gray-800 border-gray-700">
        <CardHeader className="flex flex-col items-center">
          {/* Rounded Logo */}
          <svg
            className="w-16 h-16 mb-4"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="50" fill="#1f2937" />
            <path
              d="M50 20C35.29 20 23 32.29 23 47C23 61.71 35.29 74 50 74C64.71 74 77 61.71 77 47C77 32.29 64.71 20 50 20ZM50 68C38.95 68 30 59.05 30 48C30 36.95 38.95 28 50 28C61.05 28 70 36.95 70 48C70 59.05 61.05 68 50 68Z"
              fill="#6b7280"
            />
            <path
              d="M50 32C44.48 32 40 36.48 40 42C40 47.52 44.48 52 50 52C55.52 52 60 47.52 60 42C60 36.48 55.52 32 50 32Z"
              fill="#1f2937"
            />
          </svg>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Mindcare Admin Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          {...field}
                          className="bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-gray-500 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100"
              >
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;