import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { cn } from "./style";

const variants = cva(
  "hover:bg-neutral-500/40 rounded inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50",
  {
    variants: { size: { default: "h-8 p-2", small: "h-6 p-1" } },
    defaultVariants: { size: "default" },
  },
);

type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof variants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { asChild, children, className, size, ...restProps } = props;
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(variants({ size, className }))}
        type="button"
        {...restProps}
      >
        {children}
      </Component>
    );
  },
);
