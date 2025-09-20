import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/services/settingsService';
import { useAuthContext } from '@/contexts/AuthContext';
import WarningIcon from '@mui/icons-material/Warning';
import toast from 'react-hot-toast';

export const DeleteAccount = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinalWarning, setShowFinalWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const router = useRouter();
  const { logout } = useAuthContext();

  useEffect(() => {
    if (open && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [open, timeLeft]);

  const handleOpen = () => {
    setOpen(true);
    setTimeLeft(10);
    setShowFinalWarning(false);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
    setShowFinalWarning(false);
    setTimeLeft(10);
  };

  const handleDelete = async () => {
    if (!showFinalWarning) {
      setShowFinalWarning(true);
      return;
    }

    try {
      await deleteAccount();
      await logout();

      // Show success message before redirecting
      toast.success('Account successfully deleted', {
        duration: 3000,
        position: 'bottom-right',
      });

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: '1px solid rgba(255, 107, 107, 0.3)',
        borderRadius: 1,
        backgroundColor: 'rgba(255, 107, 107, 0.05)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#FF6B6B', fontWeight: 'bold', mb: 1 }}>
          Account Deletion
        </Typography>
        <Typography variant="body2" sx={{ color: '#FFB3B3' }}>
          Delete your account and all associated data
        </Typography>
      </Box>

      <Button
        variant="outlined"
        color="error"
        onClick={handleOpen}
        sx={{
          borderColor: '#FF6B6B',
          color: '#FF6B6B',
          '&:hover': {
            borderColor: '#FF5252',
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
          },
        }}
      >
        Delete Account
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#212A31',
              color: '#D3D9D4',

              maxWidth: '500px',
              width: '100%',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#FF6B6B',

            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <WarningIcon />
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {!showFinalWarning ? (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: '#D3D9D4' }}>
                Are you sure you want to delete your account?
              </Typography>

              <List>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Permanently delete all your data"
                    sx={{ color: '#D3D9D4' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText primary="Remove all your favorites" sx={{ color: '#D3D9D4' }} />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Delete your profile and settings"
                    sx={{ color: '#D3D9D4' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Remove your following/follower relationships"
                    sx={{ color: '#D3D9D4' }}
                  />
                </ListItem>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: '#FF6B6B' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="This action cannot be undone"
                    sx={{ color: '#FF6B6B', fontWeight: 'bold' }}
                  />
                </ListItem>
              </List>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <WarningIcon sx={{ fontSize: 48, color: '#FF6B6B', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#FF6B6B', mb: 2 }}>
                Final Warning
              </Typography>
              <Typography variant="body1" sx={{ color: '#D3D9D4' }}>
                This is your last chance to cancel. Once you click delete, your account will be
                permanently removed.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: '1px solid #2E3944',
            p: 2,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              color: '#D3D9D4',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={!showFinalWarning && timeLeft > 0}
            sx={{
              bgcolor: '#FF6B6B',
              '&:hover': {
                bgcolor: '#FF5252',
              },
              '&.Mui-disabled': {
                color: '#FFFFFF',
              },
            }}
          >
            {!showFinalWarning
              ? timeLeft > 0
                ? `Please wait ${timeLeft}s`
                : 'Delete Account'
              : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
