import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-gradient-trust text-white hover:opacity-90 shadow-sm',
  secondary: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50',
  ghost: 'text-primary-600 hover:bg-primary-50',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  className = '',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200'
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
