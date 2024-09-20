import { useAtom } from "jotai";
import type React from "react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { demParserAtom, demTickAtom } from "./atoms";
import { Slider } from "./lib/Slider";
import { Tooltip } from "./lib/Tooltip";
import { formatNumber } from "./lib/formatNumber";

export default function DemControlBar() {
  const [demParser] = useAtom(demParserAtom);
  const [demTick, setDemTick] = useAtom(demTickAtom);

  const [value, setValue] = useState(demTick);
  useEffect(() => setValue(demTick), [demTick]);
  const handleValueChange = useCallback(([nextValue]: number[]) => {
    setValue(nextValue);
  }, []);

  const [, startTransition] = useTransition();
  const handleValueCommit = useCallback(
    ([nextDemTick]: number[]) => {
      startTransition(() => {
        demParser!.runToTick(nextDemTick);
        setDemTick(demParser!.tick());
      });
    },
    [demParser, setDemTick],
  );

  const demTotalTicks = demParser?.totalTicks() ?? -1;
  const formattedTotalTicks = formatNumber(demTotalTicks);
  const tickStyle: React.CSSProperties = {
    width: `${formattedTotalTicks.length}ch`,
  };

  return (
    <div className="shrink-0 px-2 gap-x-2 min-h-10 flex items-center">
      <Tooltip content="current tick">
        <span style={tickStyle} className="text-center shrink-0 cursor-default">
          {formatNumber(demTick)}
        </span>
      </Tooltip>
      <Slider
        min={-1}
        max={demTotalTicks}
        value={[value]}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
      />
      <Tooltip content="total ticks">
        <span style={tickStyle} className="text-center shrink-0 cursor-default">
          {formattedTotalTicks}
        </span>
      </Tooltip>
    </div>
  );
}
