// 🎨 MUZZAJAZZ DESIGN SYSTEM

export const colors = {
  // Primary Elegant Palette
  primary: {
    gold: '#F4D03F',
    goldDark: '#D4AC0D',
    goldLight: '#F7DC6F',
    goldAccent: '#FFE135'
  },
  
  // Secondary Sophisticated Colors
  secondary: {
    burgundy: '#922B21',
    burgundyDark: '#641E16',
    burgundyLight: '#A93226',
    burgundyAccent: '#CB4335'
  },
  
  // Accent Warm Colors
  accent: {
    copper: '#D68910',
    copperDark: '#B7950B',
    copperLight: '#F39C12',
    amber: '#FF8C00'
  },
  
  // Modern Neutral Colors
  neutral: {
    black: '#0B0B0B',
    darkest: '#121212',
    darker: '#1E1E1E',
    dark: '#2D2D2D',
    medium: '#404040',
    light: '#757575',
    lighter: '#BDBDBD',
    cream: '#FFF8E1',
    white: '#FFFFFF'
  },
  
  // Status Colors Premium
  status: {
    success: '#27AE60',
    successLight: '#58D68D',
    warning: '#F39C12',
    warningLight: '#F8C471',
    error: '#E74C3C',
    errorLight: '#F1948A',
    info: '#3498DB',
    infoLight: '#85C1E9',
    pending: '#E67E22',
    preparing: '#16A085',
    ready: '#2ECC71',
    delivered: '#8E44AD'
  },
  
  // Glass/Blur Effects
  glass: {
    dark: 'rgba(18, 18, 18, 0.85)',
    medium: 'rgba(45, 45, 45, 0.75)',
    light: 'rgba(64, 64, 64, 0.65)',
    gold: 'rgba(244, 208, 63, 0.15)',
    burgundy: 'rgba(146, 43, 33, 0.15)'
  }
}

export const typography = {
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    heading: "'Playfair Display', serif",
    mono: "'JetBrains Mono', monospace"
  },
  
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '4rem'     // 64px
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900
  }
}

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
  '5xl': '6rem',   // 96px
  '6xl': '8rem'    // 128px
}

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
}

export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px 0 rgba(0, 0, 0, 0.2)',
  xl: '0 16px 32px 0 rgba(0, 0, 0, 0.25)',
  '2xl': '0 24px 48px 0 rgba(0, 0, 0, 0.3)',
  
  // Colored Shadows
  gold: '0 8px 32px rgba(244, 208, 63, 0.4)',
  goldSoft: '0 4px 16px rgba(244, 208, 63, 0.2)',
  burgundy: '0 8px 32px rgba(146, 43, 33, 0.4)',
  burgundySoft: '0 4px 16px rgba(146, 43, 33, 0.2)',
  copper: '0 8px 32px rgba(214, 137, 16, 0.4)',
  copperSoft: '0 4px 16px rgba(214, 137, 16, 0.2)',
  
  // Inner Shadows
  inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  insetLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.15)'
}

export const animations = {
  transition: {
    fast: '0.15s ease-out',
    normal: '0.2s ease-out',
    slow: '0.3s ease-out'
  },
  
  keyframes: {
    fadeIn: 'fadeIn 0.5s ease-out',
    slideUp: 'slideUp 0.3s ease-out',
    pulse: 'pulse 2s infinite',
    bounce: 'bounce 1s ease-out'
  }
}

// Utility Functions
export const getGradient = (color1: string, color2: string) => 
  `linear-gradient(135deg, ${color1}, ${color2})`

export const getStatusColor = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PENDING': colors.status.pending,
    'PREPARING': colors.status.preparing,
    'READY': colors.status.ready,
    'DELIVERED': colors.status.delivered,
    'success': colors.status.success,
    'warning': colors.status.warning,
    'error': colors.status.error,
    'info': colors.status.info
  }
  return statusMap[status] || colors.neutral.gray
}

export const getThemeColors = (theme: 'customer' | 'kitchen' | 'admin') => {
  const themes = {
    customer: {
      primary: colors.primary.gold,
      secondary: colors.neutral.cream,
      accent: colors.accent.copper
    },
    kitchen: {
      primary: colors.accent.copper,
      secondary: colors.accent.copperDark,
      accent: colors.primary.gold
    },
    admin: {
      primary: colors.secondary.burgundy,
      secondary: colors.secondary.burgundyDark,
      accent: colors.primary.gold
    }
  }
  return themes[theme]
}