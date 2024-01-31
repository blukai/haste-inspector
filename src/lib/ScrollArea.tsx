import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import React from "react";
import { cn } from "./style";

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>((props, ref) => {
  const { className, orientation = "vertical", ...restProps } = props;
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none",
        orientation === "vertical" && "h-full w-2.5",
        orientation === "horizontal" && "h-2.5 flex-col",
        className,
      )}
      {...restProps}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-divider" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});

type ScrollAreaProps = {
  viewportRef?: React.Ref<HTMLDivElement>;
} & React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>;

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>((props, ref) => {
  const { className, children, viewportRef, ...restProps } = props;
  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...restProps}
    >
      <ScrollAreaPrimitive.Viewport ref={viewportRef} className="h-full w-full">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
