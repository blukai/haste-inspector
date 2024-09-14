import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import React from "react";
import { cn } from "./style";
import { CheckIcon } from "lucide-react";

export * from "@radix-ui/react-dropdown-menu";

export const CheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>((props, ref) => {
  const { className, checked, children, ...restProps } = props;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "flex items-center hover:bg-neutral-500/40 rounded px-2 py-0.5 gap-x-2 cursor-pointer",
        className,
      )}
      checked={checked}
      {...restProps}
    >
      <DropdownMenuPrimitive.ItemIndicator forceMount>
        <CheckIcon className={cn("size-4", !checked && "invisible")} />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
