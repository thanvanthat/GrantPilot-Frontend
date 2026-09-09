import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-gov text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Saffron is the primary action colour across the portal
        default: 'bg-saffron-500 text-white hover:bg-saffron-600 shadow-sm',
        navy: 'bg-navy-900 text-white hover:bg-navy-950 shadow-sm',
        outline: 'border-2 border-navy-900 text-navy-900 bg-white hover:bg-navy-50',
        outlineSaffron: 'border-2 border-saffron-500 text-saffron-700 bg-white hover:bg-saffron-50',
        ghost: 'text-navy-900 hover:bg-navy-50',
        subtle: 'bg-gov-bg text-gov-ink border border-gov-border hover:bg-slate-100',
        danger: 'bg-gov-red text-white hover:brightness-95',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, ...props }) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
