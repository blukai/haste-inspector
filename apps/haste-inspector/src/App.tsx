import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useAtom } from "jotai";
import AppLayout from "./AppLayout";
import Dem from "./Dem";
import Welcome from "./Welcome";
import { demFileAtom } from "./atoms";

export default function App() {
  const [demFile] = useAtom(demFileAtom);

  return (
    <TooltipPrimitive.Provider delayDuration={0} disableHoverableContent>
      <AppLayout>
        {!demFile && <Welcome />}
        {demFile && <Dem />}
      </AppLayout>
    </TooltipPrimitive.Provider>
  );
}
