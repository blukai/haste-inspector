import type React from "react";
import DemControlBar from "./DemControlBar";

type DemLayoutProps = React.PropsWithChildren;

export default function DemLayout(props: DemLayoutProps) {
  const { children } = props;
  return (
    <div className="grow flex flex-col divide-y divide-divider">
      {children}
      <DemControlBar />
    </div>
  );
}
