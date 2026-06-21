import React, { createContext, useContext } from "react";

type SelectContextType = {
  value?: string;
  onValueChange?: (v: string) => void;
};

const SelectContext = createContext<SelectContextType>({});

export const Select: React.FC<{
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
}> = ({ value, onValueChange, children }) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div>{children}</div>
  </SelectContext.Provider>
);

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const SelectValue: React.FC<{ placeholder?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ placeholder, children }) => {
  const ctx = useContext(SelectContext);
  return <div>{ctx.value ?? children ?? placeholder}</div>;
};

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const SelectItem: React.FC<{ value: string } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ value, children, ...props }) => {
  const ctx = useContext(SelectContext);
  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        props.onClick?.(e as any);
        ctx.onValueChange?.(value);
      }}
    >
      {children}
    </button>
  );
};

export default Select;
