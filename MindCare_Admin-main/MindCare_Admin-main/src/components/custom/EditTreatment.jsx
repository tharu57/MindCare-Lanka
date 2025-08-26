import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { toast } from 'sonner';
import axios from 'axios';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Deep comparison to detect changes
const hasChanges = (current, initial) => {
  const keys = Object.keys(current);
  for (const key of keys) {
    if (key === 'image') {
      if (current[key] !== initial[key]) {
        return true;
      }
    } else if (current[key] !== initial[key]) {
      return true;
    }
  }
  return false;
};

const EditTreatment = ({ treatment, open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(treatment?.image_path || null);
  const [initialValues, setInitialValues] = useState({});
  const [changedFields, setChangedFields] = useState({});

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: null,
    },
  });

  useEffect(() => {
    if (treatment && open) {
      const defaultValues = {
        name: treatment.name || '',
        description: treatment.description || '',
        price: treatment.price ? treatment.price.toString() : '',
        image: null,
      };
      form.reset(defaultValues);
      setInitialValues(defaultValues);
      setImagePreview(treatment.image_path || null);
      setChangedFields({});
    }
  }, [treatment, open, form]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      if (data.image) {
        formData.append('image', data.image);
      }

      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        formDataEntries[key] = value instanceof File ? value.name : value;
      }
      console.log('Sending FormData:', formDataEntries);

      const response = await axios.put(`http://localhost:5000/api/treatments/${treatment.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });
      console.log('PUT response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('PUT onSuccess:', data);
      toast.success(data.message || 'Treatment updated successfully', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      queryClient.invalidateQueries(['treatments']);
      setInitialValues(form.getValues());
      setChangedFields({});
    },
    onError: (error) => {
      console.error('PUT error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
        code: error.code,
      });
      toast.error(error.response?.data?.error || 'Failed to update treatment', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  const debouncedMutate = debounce((data) => {
    if (data.name && data.price && parseFloat(data.price) > 0 && hasChanges(data, initialValues)) {
      mutation.mutate(data);
    }
  }, 500);

  const handleFieldChange = (fieldName, value, field) => {
    field.onChange(value);
    setChangedFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const triggerUpdate = () => {
    const formData = form.getValues();
    debouncedMutate({
      ...formData,
      price: parseFloat(formData.price) || 0,
      image: formData.image,
    });
  };

  const handleImageChange = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size exceeds 2MB limit', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        field.onChange(null);
        setImagePreview(treatment?.image_path || null);
        return;
      }
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid image type. Allowed: png, jpg, jpeg, gif', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
        field.onChange(null);
        setImagePreview(treatment?.image_path || null);
        return;
      }
      field.onChange(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      handleFieldChange('image', file);
    } else {
      field.onChange(null);
      setImagePreview(treatment?.image_path || null);
      handleFieldChange('image', null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full bg-white px-10 pb-4 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">Edit Treatment</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: 'Treatment name is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter treatment name"
                      {...field}
                      onChange={(e) => handleFieldChange('name', e.target.value, field)}
                      onBlur={triggerUpdate}
                      className="border-gray-300"
                    />
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
            <FormField
              control={form.control}
              name="description"
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      {...field}
                      onChange={(e) => handleFieldChange('description', e.target.value, field)}
                      onBlur={triggerUpdate}
                      className="border-gray-300"
                    />
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
                      onChange={(e) => handleFieldChange('price', e.target.value, field)}
                      onBlur={triggerUpdate}
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
                          onBlur={triggerUpdate}
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
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditTreatment;