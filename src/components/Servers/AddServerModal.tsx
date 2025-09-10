import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuthContext } from '@/contexts/AuthContext';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServerAdded: () => void;
  editingServer?: {
    id: number;
    link: string;
    owner: string;
    rules: string;
    expires: string;
  } | null;
}

const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  onServerAdded,
  editingServer,
}) => {
  const { isAuthenticated } = useAuthContext();
  const [link, setLink] = React.useState('');
  const [rules, setRules] = React.useState('');
  const [expires, setExpires] = React.useState<Date | null>(null);
  const [neverExpires, setNeverExpires] = React.useState(false);
  const [originalExpires, setOriginalExpires] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Character limits
  const MAX_RULES_LENGTH = 200;

  // Handle rules input with character limit
  const handleRulesChange = (value: string) => {
    if (value.length <= MAX_RULES_LENGTH) {
      setRules(value);
    }
  };

  const cleanRulesText = (text: string): string => {
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  };

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when modal opens/closes or editingServer changes
  React.useEffect(() => {
    if (isOpen) {
      // gate via auth hook
      if (!isAuthenticated) {
        toast.error('Please log in to add a server');
        onClose();
        return;
      }

      if (editingServer) {
        setLink(editingServer.link);
        setRules(editingServer.rules);
        if (editingServer.expires === 'Never') {
          setNeverExpires(true);
          setExpires(null);
          setOriginalExpires(null);
        } else {
          const expirationDate = new Date(parseInt(editingServer.expires) * 1000);
          setNeverExpires(false);
          setExpires(expirationDate);
          setOriginalExpires(expirationDate);
        }
      } else {
        // Reset form for new server
        setLink('');
        setRules('');
        setExpires(null);
        setOriginalExpires(null);
        setNeverExpires(false);
      }
    }
  }, [isOpen, editingServer, onClose, isAuthenticated]);

  const handleSubmit = async () => {
    if (!link.trim()) {
      toast.error('Please enter a server link');
      return;
    }

    if (rules.length > MAX_RULES_LENGTH) {
      toast.error(`Server rules cannot exceed ${MAX_RULES_LENGTH} characters`);
      return;
    }

    if (!neverExpires && !expires) {
      toast.error('Please select an expiration date');
      return;
    }

    // Check if the expiration date is in the past
    if (!neverExpires && expires) {
      const now = new Date();
      if (expires < now) {
        toast.error('Expiration date cannot be in the past');
        return;
      }

      // Check if expiration date is at least 7 days from now
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      if (expires < sevenDaysFromNow) {
        toast.error('Expiration date must be at least 7 days from now');
        return;
      }
    }

    // auth enforced server-side via cookie; client just gates UX

    setLoading(true);
    try {
      // Check if the expiration date is more than 1 year away
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      const endpoint = editingServer
        ? `/api/servers/update?id=${editingServer.id}`
        : `/api/servers/add`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: link.trim(),
          rules: cleanRulesText(rules) || 'N/A',
          expires:
            neverExpires || (expires && expires > oneYearFromNow)
              ? 'Never'
              : expires
                ? String(Math.floor(expires.getTime() / 1000))
                : null,
        }),
      });

      if (response.ok) {
        toast.success(
          editingServer ? 'Server updated successfully!' : 'Server added successfully!',
        );
        onServerAdded();
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to save server' }));
        if (response.status === 409) {
          toast.error('This server already exists');
        } else if (response.status === 403) {
          toast.error('Server link must start with: https://www.roblox.com/share?code=');
        } else {
          toast.error(`Error saving server: ${errorData.message}`);
        }
      }
    } catch (err) {
      toast.error('An error occurred while saving the server');
      console.error('Save server error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-[#212A31] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2E3944] p-4">
          <h2 className="text-muted text-xl font-semibold">
            {editingServer ? 'Edit Server' : 'Add New Server'}
          </h2>
          <button
            onClick={onClose}
            className="hover:text-muted rounded-md p-1 text-[#FFFFFF] hover:bg-[#2E3944]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="server-link" className="text-muted mb-2 block text-sm font-medium">
                Server Link <span className="text-red-500">*</span>
              </label>
              <input
                id="server-link"
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="text-muted w-full rounded-md border border-[#2E3944] bg-[#2E3944] px-3 py-2 placeholder-[#FFFFFF] focus:border-[#5865F2] focus:outline-none"
                placeholder="Enter the server link"
              />
              <p className="mt-1 text-sm text-[#FFFFFF]">
                Enter the full private server link from Roblox
              </p>
            </div>

            <div>
              <label htmlFor="server-rules" className="text-muted mb-2 block text-sm font-medium">
                Server Rules
              </label>
              <textarea
                id="server-rules"
                value={rules}
                onChange={(e) => handleRulesChange(e.target.value)}
                rows={4}
                maxLength={MAX_RULES_LENGTH}
                className="text-muted w-full rounded-md border border-[#2E3944] bg-[#2E3944] px-3 py-2 placeholder-[#FFFFFF] focus:border-[#5865F2] focus:outline-none"
                placeholder="Enter the server rules"
              />
              <p className="mt-1 text-sm text-[#FFFFFF]">
                Optional: Add any specific rules or requirements for joining the server
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={neverExpires}
                  onChange={(e) => {
                    setNeverExpires(e.target.checked);
                    if (e.target.checked) {
                      setExpires(null);
                    } else {
                      setExpires(originalExpires);
                    }
                  }}
                  className="h-4 w-4 rounded border-[#2E3944] bg-[#2E3944] text-[#5865F2] focus:ring-[#5865F2]"
                />
                <span className="text-muted text-sm">Never Expires</span>
              </label>
              <p className="mt-1 text-sm text-[#FFFFFF]">
                Check this if the server link should remain active indefinitely
              </p>
            </div>

            <div>
              <div className="text-muted mb-2 flex items-center text-sm font-medium">
                Expires <span className="text-red-500">*</span>
              </div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={expires}
                  onChange={(date) => setExpires(date)}
                  minDate={new Date()}
                  disabled={neverExpires}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      placeholder: 'Select expiration date',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#2E3944',
                          borderColor: '#2E3944',
                          color: '#D3D9D4',
                          '&:hover': {
                            borderColor: '#5865F2',
                          },
                          '&.Mui-focused': {
                            borderColor: '#5865F2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: '#D3D9D4',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
              <p className="mt-1 text-sm text-[#FFFFFF]">
                When will this server link expire? Must be at least 7 days from now
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end space-x-4 border-t border-[#2E3944] pt-6">
              <button
                onClick={onClose}
                className="text-muted rounded-md px-4 py-2 text-sm font-medium hover:bg-[#2E3944]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752C4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? editingServer
                    ? 'Saving Changes...'
                    : 'Adding Server...'
                  : editingServer
                    ? 'Edit Server'
                    : 'Add Server'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServerModal;
