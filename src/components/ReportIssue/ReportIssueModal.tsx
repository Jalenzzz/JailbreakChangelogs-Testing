'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
// import { PUBLIC_API_URL } from '@/utils/api';
import { useAuthContext } from '@/contexts/AuthContext';

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportIssueModal({ isOpen, onClose }: ReportIssueModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.length > MAX_TITLE_LENGTH) {
      toast.error(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isAuthenticated) {
        toast.error('You must be logged in to report an issue');
        return;
      }

      const response = await fetch('/api/issues/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit issue');
      }

      toast.success('Issue reported successfully');
      onClose();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast.error('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="border-secondary-text bg-secondary-bg mx-auto w-full max-w-sm rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-primary-text text-xl font-semibold">
              Report an Issue
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-secondary-text hover:bg-primary-bg hover:text-primary-text rounded-full p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="text-secondary-text block text-sm font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="placeholder-secondary-text border-secondary-text bg-primary-bg text-primary-text focus:border-button-info focus:ring-button-info mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="Brief description of the issue"
                required
              />
              <p className="text-secondary-text mt-1 text-xs">
                Maximum {MAX_TITLE_LENGTH} characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-secondary-text block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="placeholder-secondary-text border-secondary-text bg-primary-bg text-primary-text focus:border-button-info focus:ring-button-info mt-1 block w-full rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
                placeholder="Detailed description of the issue"
                required
              />
              <p className="text-secondary-text mt-1 text-xs">
                Maximum {MAX_DESCRIPTION_LENGTH} characters
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="text-secondary-text border-secondary-text hover:bg-primary-bg hover:text-primary-text rounded-md border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-button-info text-primary-text hover:bg-button-info-hover focus:ring-button-info rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
