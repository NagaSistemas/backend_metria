import { colors, spacing, borderRadius, shadows, animations } from '../../lib/design-system'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  theme?: 'customer' | 'kitchen' | 'admin'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export default function Card({
  children,
  variant = 'default',
  theme = 'customer',
  padding = 'md',
  hover = false,
  onClick,
  style = {}
}: CardProps) {
  
  const getVariantStyles = () => {
    const themeColors = {
      customer: colors.primary.gold,
      kitchen: colors.accent.copper,
      admin: colors.secondary.burgundy
    }
    
    const accentColor = themeColors[theme]
    const glassColor = theme === 'customer' ? colors.glass.gold : 
                      theme === 'kitchen' ? 'rgba(214, 137, 16, 0.1)' : colors.glass.burgundy
    
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.glass.dark,
          border: `1px solid ${colors.neutral.medium}`,
          backdropFilter: 'blur(12px)',
          boxShadow: shadows.md
        }
      case 'elevated':
        return {
          background: `linear-gradient(145deg, ${colors.glass.dark}, ${colors.glass.medium})`,
          border: `1px solid ${accentColor}40`,
          backdropFilter: 'blur(16px)',
          boxShadow: `${shadows.lg}, 0 0 0 1px ${accentColor}20`
        }
      case 'outlined':
        return {
          backgroundColor: colors.glass.light,
          border: `2px solid ${accentColor}`,
          backdropFilter: 'blur(8px)',
          boxShadow: shadows.sm
        }
      case 'glass':
        return {
          backgroundColor: glassColor,
          border: `1px solid ${accentColor}30`,
          backdropFilter: 'blur(20px)',
          boxShadow: `${shadows.xl}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        }
      default:
        return {}
    }
  }
  
  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return { padding: spacing.lg }
      case 'md':
        return { padding: spacing.xl }
      case 'lg':
        return { padding: spacing['2xl'] }
      default:
        return {}
    }
  }
  
  const baseStyles: React.CSSProperties = {
    borderRadius: borderRadius['3xl'],
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: onClick ? 'pointer' : 'default',
    color: colors.neutral.white,
    position: 'relative',
    overflow: 'hidden',
    ...getVariantStyles(),
    ...getPaddingStyles(),
    ...style
  }
  
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || onClick) {
      e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'
      const enhancedShadow = theme === 'customer' ? shadows.gold : 
                            theme === 'kitchen' ? shadows.copper : shadows.burgundy
      e.currentTarget.style.boxShadow = `${enhancedShadow}, ${shadows['2xl']}`
      e.currentTarget.style.filter = 'brightness(1.05)'
    }
  }
  
  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || onClick) {
      e.currentTarget.style.transform = 'translateY(0) scale(1)'
      e.currentTarget.style.boxShadow = baseStyles.boxShadow || 'none'
      e.currentTarget.style.filter = 'brightness(1)'
    }
  }
  
  return (
    <div
      style={baseStyles}
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </div>
  )
}