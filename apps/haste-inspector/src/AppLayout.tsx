import { useAtom } from "jotai";
import AppBar from "./AppBar";
import { fullWidthAtom } from "./atoms";
import { cn } from "./lib/style";

type AppLayoutProps = React.PropsWithChildren;

export default function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  const [fullWidth] = useAtom(fullWidthAtom);

  return (
    <div
      className={cn(
        "mx-auto flex flex-col divide-y divide-divider h-screen overflow-hidden w-full min-w-[40rem]",
        !fullWidth && "max-w-[80rem] border-x border-divider",
      )}
    >
      <AppBar />
      {children}
    </div>
  );
}
