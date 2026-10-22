import React from 'react';
import { Button } from 'antd';

export const AppButton = React.forwardRef(({ children, className, style: rawStyle, ...props }, ref) => {
  // Primary buttons take their colours from the theme (white-on-dark or
  // dark-on-light). Callers still pass color '#000' from the dark-only days;
  // drop it so the label stays visible in the light theme.
  let style = rawStyle;
  if (props.type === 'primary' && style) {
    const { color: _color, background: _bg, backgroundColor: _bgc, ...rest } = style;
    style = rest;
  }
  const bg = style?.backgroundColor || style?.background;
  const isWhite = bg === 'white' || bg === '#fff';
  const mergedStyle = {
    ...style,
    backgroundColor: style?.backgroundColor ?? style?.background ?? undefined,
    color: isWhite ? '#000' : style?.color,
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  };
  const mergedClassName = `${className ?? ''} ${isWhite ? 'app-btn--white' : 'app-btn'}`.trim();
  return (
    <Button ref={ref} className={mergedClassName} style={mergedStyle} {...props}>
      {children}
    </Button>
  );
});
