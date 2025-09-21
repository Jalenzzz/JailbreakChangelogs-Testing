import React from 'react';
import { Skeleton } from '@mui/material';

export default function Loading() {
  return (
    <div className="space-y-6 pb-8">
      <div className="border-stroke bg-secondary-bg rounded-lg border p-4">
        <Skeleton variant="rectangular" height={200} className="bg-secondary-bg rounded-lg" />
      </div>
      <div className="border-stroke bg-secondary-bg rounded-lg border p-4">
        <Skeleton variant="rectangular" height={400} className="bg-secondary-bg rounded-lg" />
      </div>
    </div>
  );
}
