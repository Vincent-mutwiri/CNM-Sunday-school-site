import * as React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ children, ...props }, ref) => (
  <label className="inline-flex items-center space-x-2">
    <input type="checkbox" ref={ref} className="h-4 w-4" {...props} />
    {children && <span>{children}</span>}
  </label>
));
Checkbox.displayName = 'Checkbox';

export default Checkbox;
