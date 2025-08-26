import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { format } from 'date-fns';

const ProcessAppointment = ({ appointment, open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full bg-white pt-8 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle className="text-xl font-bold text-gray-800">
              Appointment {appointment?.appointmentNo}
            </SheetTitle>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                appointment?.status === 'Pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              )}
            >
              {appointment?.status}
            </span>
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-4 p-8 ">
          <div className='flex justify-between '>
            <strong className="text-sm font-medium text-gray-600">Appointment No:</strong>
            <p className="text-sm text-gray-700">{appointment?.appointmentNo}</p>
          </div>
          <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Patient Name:</strong>
            <p className="text-sm text-gray-700">{appointment?.patientName}</p>
          </div>
         <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Treatment:</strong>
            <p className="text-sm text-gray-700">{appointment?.treatment}</p>
          </div>
          <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Doctor:</strong>
            <p className="text-sm text-gray-700">{appointment?.doctor}</p>
          </div>
         <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Date:</strong>
            <p className="text-sm text-gray-700">
              {appointment?.date ? format(appointment.date, 'MMM dd, yyyy') : '-'}
            </p>
          </div>
          <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Time:</strong>
            <p className="text-sm text-gray-700">{appointment?.time}</p>
          </div>
         <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Price:</strong>
            <p className="text-sm text-gray-700">${appointment?.price?.toFixed(2)}</p>
          </div>
          <div className='flex justify-between'>
            <strong className="text-sm font-medium text-gray-600">Status:</strong>
            <p className="text-sm text-gray-700">{appointment?.status}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProcessAppointment;