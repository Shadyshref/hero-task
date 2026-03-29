import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-zinc-800 bg-black px-4 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-0 disabled:cursor-not-allowed disabled:text-zinc-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
