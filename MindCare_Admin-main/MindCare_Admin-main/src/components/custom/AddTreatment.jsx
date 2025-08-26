import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Upload, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { toast } from 'sonner';
import axios from 'axios';

const AddTreatment = () => {
  // Initialize React Hook Form
  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: null,
    },
  });

  // State for image preview, endpoint status, and sheet open state
  const [imagePreview, setImagePreview] = useState(null);
  const [endpointStatus, setEndpointStatus] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Check endpoint availability on mount
  useEffect(() => {
    const checkEndpoint = async () => {
      try {
        // Use GET request to check endpoint
        const response = await axios.get('http://localhost:5000/api/treatments', {
          timeout: 5000,
        });
        console.log('Endpoint check: /api/treatments is available', response.data);
        setEndpointStatus('available');
      } catch (error) {
        console.error('Endpoint check error:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
          } : null,
          code: error.code,
        });
        setEndpointStatus('unavailable');
        toast.error('Backend endpoint unavailable. Please ensure the server is running on http://localhost:5000.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
      }
    };
    checkEndpoint();
  }, []);

  // Define mutation for form submission
  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      if (data.image) {
        formData.append('image', data.image);
      }

      // Log FormData for debugging
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Sending FormData:', formDataEntries);

      const response = await axios.post('http://localhost:5000/api/treatments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log('POST response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('POST onSuccess:', data);
      toast.success(data.message || 'Treatment added successfully', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      form.reset();
      setImagePreview(null);
      setIsSheetOpen(false); // Close the sheet
    },
    onError: (error) => {
      console.error('POST error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : null,
        code: error.code,
      });
      const errorMessage = error.response?.status === 404
        ? 'Endpoint not found. Please check if the backend server is running and the /api/treatments route is registered.'
        : error.response?.data?.error || error.message || 'Failed to add treatment';
      toast.error(errorMessage, {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    if (endpointStatus === 'unavailable') {
      toast.error('Cannot submit: Backend endpoint is unavailable.', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
      return;
    }
    const formattedData = {
      ...data,
      price: parseFloat(data.price),
      image: data.image,
    };
    mutation.mutate(formattedData);
  };

  // Handle image file selection
  const handleImageChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        field.onChange(null);
        setImagePreview(null);
        return;
      }
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid image type. Allowed: png, jpg, jpeg, gif', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        field.onChange(null);
        setImagePreview(null);
        return;
      }
      field.onChange(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      field.onChange(null);
      setImagePreview(null);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white" disabled={endpointStatus === 'unavailable'}>
          <Plus className="h-5 w-5 mr-2" />
          Add Treatment
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full bg-white px-10 pb-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">Add New Treatment</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Treatment Name */}
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Treatment name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter treatment name" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
                    {form.formState.errors.name && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.name.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} className="border-gray-300" />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
                    {form.formState.errors.description && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.description.message}
                      </>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              rules={{
                required: 'Price is required',
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: 'Enter a valid number (e.g., 50 or 50.00)',
                },
                validate: (value) => parseFloat(value) > 0 || 'Price must be a positive number',
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter price"
                      {...field}
                      className="border-gray-300"
                    />
                  </FormControl>
                  <FormMessage className="flex items-center gap-1 text-red-500">
                    {form.formState.errors.price && (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        {form.formState.errors.price.message}
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
                      {/* Image Preview */}
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
                      {/* Image Upload Button */}
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
                          accept="image/png,image/jpeg,image/jpg,image/gif"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={mutation.isLoading || endpointStatus === 'unavailable'}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Treatment'
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddTreatment;