import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "./style";

const variants = cva(
  "hover:bg-neutral-500/30 rounded inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50",
  {
    variants: { size: { default: "h-8 p-2", small: "h-6 p-1" } },
    defaultVariants: { size: "default" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { children, className, size, ...restProps } = props;
    return (
      <button
        ref={ref}
        className={cn(variants({ size, className }))}
        {...restProps}
      >
        {children}
      </button>
    );
  },
);
