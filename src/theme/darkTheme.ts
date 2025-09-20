import { createTheme } from '@mui/material';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2462CD', // --color-button-info
    },
    secondary: {
      main: '#2cb67d', // --color-tertiary
    },
    background: {
      paper: '#242629', // --color-secondary-bg
      default: '#16161a', // --color-primary-bg
    },
    text: {
      primary: '#fffffe', // --color-primary-text
      secondary: '#94a1b2', // --color-secondary-text
    },
    error: {
      main: '#ed4f4f', // --color-button-danger
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#fffffe', // --color-primary-text
          '& fieldset': {
            borderColor: '#010101', // --color-stroke
          },
          '&:hover fieldset': {
            borderColor: '#2462CD', // --color-button-info
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2462CD', // --color-button-info
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#fffffe', // --color-primary-text
          '&.Mui-focused': {
            color: '#2462CD', // --color-button-info
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#fffffe', // --color-primary-text
        },
        input: {
          color: '#fffffe', // --color-primary-text
          '&::placeholder': {
            color: '#fffffe', // --color-primary-text
            opacity: 1,
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#fffffe', // --color-primary-text
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#16161a', // --color-primary-bg
          color: '#fffffe', // --color-primary-text
          fontSize: '0.875rem',
          border: '1px solid #010101', // --color-stroke
        },
        arrow: {
          color: '#16161a', // --color-primary-bg
          '&::before': {
            border: '1px solid #010101', // --color-stroke
          },
        },
      },
    },
  },
});
