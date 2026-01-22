import React from 'react';
import { Button } from 'antd';

export const AppButton = React.forwardRef(({ children, ...props }, ref) => {
  return (
    <Button ref={ref} {...props}>
      {children}
    </Button>
  );
});

