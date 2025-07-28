import { colors, spacing, borderRadius, typography, animations } from '../../lib/design-system'

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'date'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  theme?: 'customer' | 'kitchen' | 'admin'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  error?: boolean
  icon?: React.ReactNode
  style?: React.CSSProperties
}

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyPress,
  theme = 'customer',
  size = 'md',
  disabled = false,
  error = false,
  icon,
  style = {}
}: InputProps) {
  
  const getThemeStyles = () => {
    const themeColors = {
      customer: colors.primary.gold,
      kitchen: colors.accent.copper,
      admin: colors.secondary.burgundy
    }
    
    const accentColor = themeColors[theme]
    
    return {
      borderColor: error ? colors.status.error : colors.neutral.gray,
      focusBorderColor: error ? colors.status.error : accentColor
    }
  }
  
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${spacing.sm} ${spacing.md}`,
          fontSize: typography.sizes.sm,
          height: '36px'
        }
      case 'md':
        return {
          padding: `${spacing.md} ${spacing.lg}`,
          fontSize: typography.sizes.base,
          height: '44px'
        }
      case 'lg':
        return {
          padding: `${spacing.lg} ${spacing.xl}`,
          fontSize: typography.sizes.lg,
          height: '52px'
        }
      default:
        return {}
    }
  }
  
  const themeStyles = getThemeStyles()
  const sizeStyles = getSizeStyles()
  
  const baseStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: colors.neutral.gray,
    border: `2px solid ${themeStyles.borderColor}`,
    borderRadius: borderRadius.lg,
    color: colors.neutral.white,
    fontFamily: typography.fonts.primary,
    outline: 'none',
    transition: animations.transition.normal,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    ...sizeStyles,
    ...style
  }
  
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  }
  
  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    left: spacing.md,
    color: colors.neutral.lightGray,
    pointerEvents: 'none',
    zIndex: 1
  }
  
  const inputWithIconStyles: React.CSSProperties = {
    ...baseStyles,
    paddingLeft: icon ? `calc(${spacing['2xl']} + ${spacing.md})` : baseStyles.paddingLeft
  }
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = themeStyles.focusBorderColor
    e.currentTarget.style.boxShadow = `0 0 0 3px ${themeStyles.focusBorderColor}20`
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = themeStyles.borderColor
    e.currentTarget.style.boxShadow = 'none'
  }
  
  return (
    <div style={containerStyles}>
      {icon && <div style={iconStyles}>{icon}</div>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={icon ? inputWithIconStyles : baseStyles}
      />
    </div>
  )
}