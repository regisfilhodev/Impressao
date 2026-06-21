import React from "react";

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={className} style={{ overflow: "auto" }} {...props}>{children}</div>
);

export default ScrollArea;
