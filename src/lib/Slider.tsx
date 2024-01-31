import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { cn } from "./style";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>((props, ref) => {
  const { className, ...restProps } = props;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full flex items-center data-[disabled]:pointer-events-none Adata-[disabled]:opacity-50",
        className,
      )}
      {...restProps}
    >
      <SliderPrimitive.Track className="relative w-full h-1.5 rounded-full overflow bg-neutral-500/30">
        <SliderPrimitive.Range className="absolute h-full bg-current" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full border-2 border-fg-subtle bg-bg" />
    </SliderPrimitive.Root>
  );
});
