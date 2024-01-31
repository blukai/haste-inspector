import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = React.PropsWithChildren & {
  content: TooltipPrimitive.TooltipContentProps["children"];
} & Pick<TooltipPrimitive.TooltipContentProps, "align" | "side">;

export function Tooltip(props: TooltipProps) {
  const { children, content, align, side } = props;

  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Content
        sideOffset={8}
        align={align}
        side={side}
        className="bg-white dark:bg-black px-2 py-0.5 rounded z-10"
      >
        {content}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Root>
  );
}
