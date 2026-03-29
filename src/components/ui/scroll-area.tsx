import * as React from 'react';
import { cn } from '../../lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
}

export function ScrollArea({
  className,
  viewportClassName,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <div className={cn('relative min-h-0', className)} {...props}>
      <div className={cn('h-full w-full overflow-y-auto overflow-x-hidden', viewportClassName)}>
        {children}
      </div>
    </div>
  );
}
