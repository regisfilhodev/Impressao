import React from "react";

export const Checkbox: React.FC<{
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}> = ({ id, checked, onCheckedChange, className }) => {
  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      className={className}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
};

export default Checkbox;
