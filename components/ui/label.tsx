import React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...props }) => (
  <label className={className} {...props}>{children}</label>
);

export default Label;
