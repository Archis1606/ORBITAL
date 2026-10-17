import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type Shared = {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'ghost' | 'line'
}

type ButtonAsButton = Shared &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined
  }

type ButtonAsLink = Shared & {
  to: string
}

export function Button({ className, variant = 'primary', children, ...props }: ButtonAsButton | ButtonAsLink) {
  const styles = cn(
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition duration-200',
    'disabled:cursor-not-allowed disabled:opacity-40',
    variant === 'primary' && 'bg-cyan text-void hover:brightness-110',
    variant === 'ghost' && 'bg-white/5 text-ivory hover:bg-white/10',
    variant === 'line' && 'border border-line text-ivory hover:border-cyan/50',
    className,
  )

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={styles}>
        {children}
      </Link>
    )
  }

  const buttonProps = props as ButtonAsButton
  return (
    <button type={buttonProps.type ?? 'button'} className={styles} {...buttonProps}>
      {children}
    </button>
  )
}
