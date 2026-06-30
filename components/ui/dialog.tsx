import React from "react";

export const Dialog: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;

// DialogTrigger supports `asChild` pattern: when `asChild` is true we
// render the provided child element (cloning it with the trigger props)
// to avoid creating an extra wrapper element (prevents nested <button>).
export const DialogTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }> = ({ children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    // Clone the child and merge props, but do not pass `asChild` down.
    return React.cloneElement(children as React.ReactElement, props as any);
  }

  // Ensure we don't accidentally forward non-standard props to DOM
  return (
    <button type="button" {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export default Dialog;
