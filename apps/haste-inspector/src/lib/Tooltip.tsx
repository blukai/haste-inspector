import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

type TooltipProps = React.PropsWithChildren & {
  content: TooltipPrimitive.TooltipContentProps["children"];
} & Pick<TooltipPrimitive.TooltipContentProps, "align" | "side">;

export const Tooltip = React.forwardRef<HTMLButtonElement, TooltipProps>(
  (props, ref) => {
    const { children, content, align, side } = props;

    return (
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild ref={ref}>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            align={align}
            side={side}
            className="bg-white dark:bg-black px-2 py-0.5 rounded"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    );
  },
);
