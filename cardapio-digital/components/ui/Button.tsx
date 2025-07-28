import { colors, spacing, borderRadius, shadows, animations } from '../../lib/design-system'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'customer' | 'kitchen' | 'admin'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  theme = 'customer',
  disabled = false,
  loading = false,
  onClick,
  style = {}
}: ButtonProps) {
  
  const getVariantStyles = () => {
    const themeColors = {
      customer: colors.primary.gold,
      kitchen: colors.accent.copper,
      admin: colors.secondary.burgundy
    }
    
    const primaryColor = themeColors[theme]
    const shadowColor = theme === 'customer' ? shadows.goldSoft : 
                       theme === 'kitchen' ? shadows.copperSoft : shadows.burgundySoft
    
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${primaryColor}, ${themeColors[theme] === colors.primary.gold ? colors.primary.goldDark : themeColors[theme] === colors.accent.copper ? colors.accent.copperDark : colors.secondary.burgundyDark})`,
          color: colors.neutral.white,
          border: 'none',
          boxShadow: shadowColor,
          fontWeight: 600
        }
      case 'secondary':
        return {
          backgroundColor: colors.glass.medium,
          color: colors.neutral.white,
          border: `1px solid ${colors.neutral.medium}`,
          backdropFilter: 'blur(10px)',
          boxShadow: shadows.sm
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryColor,
          border: `2px solid ${primaryColor}`,
          backdropFilter: 'blur(5px)'
        }
      case 'ghost':
        return {
          backgroundColor: colors.glass.light,
          color: primaryColor,
          border: 'none',
          backdropFilter: 'blur(8px)'
        }
      case 'danger':
        return {
          background: `linear-gradient(135deg, ${colors.status.error}, ${colors.status.errorLight})`,
          color: colors.neutral.white,
          border: 'none',
          boxShadow: '0 4px 16px rgba(231, 76, 60, 0.3)'
        }
      default:
        return {}
    }
  }
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${spacing.sm} ${spacing.lg}`,
          fontSize: '0.875rem',
          borderRadius: borderRadius['2xl'],
          minHeight: '36px'
        }
      case 'md':
        return {
          padding: `${spacing.md} ${spacing.xl}`,
          fontSize: '1rem',
          borderRadius: borderRadius['2xl'],
          minHeight: '44px'
        }
      case 'lg':
        return {
          padding: `${spacing.lg} ${spacing['2xl']}`,
          fontSize: '1.125rem',
          borderRadius: borderRadius['3xl'],
          minHeight: '52px'
        }
      default:
        return {}
    }
  }
  
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: animations.transition.normal,
    opacity: disabled || loading ? 0.6 : 1,
    outline: 'none',
    fontFamily: 'inherit',
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style
  }
  
  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
      const enhancedShadow = theme === 'customer' ? shadows.gold : 
                            theme === 'kitchen' ? shadows.copper : shadows.burgundy
      e.currentTarget.style.boxShadow = enhancedShadow
      e.currentTarget.style.filter = 'brightness(1.1)'
    }
  }
  
  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.boxShadow = baseStyles.boxShadow || 'none'
      e.currentTarget.style.filter = 'brightness(1)'
    }
  }
  
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)'
    }
  }
  
  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'
    }
  }
  
  return (
    <button
      style={baseStyles}
      onClick={disabled || loading ? undefined : onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || loading}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  )
}