import { useAtom } from "jotai";
import {
  GithubIcon,
  Maximize2Icon,
  Minimize2Icon,
  MoonIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import { useLayoutEffect } from "react";
import { darkModeAtom, demFileAtom, fullWidthAtom } from "./atoms";
import { Button } from "./lib/Button";
import { Tooltip } from "./lib/Tooltip";

function IconSection() {
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center size-8 -ml-1 group relative">
        <img
          src={`${import.meta.env.BASE_URL}/haste.png`}
          className="size-4 absolute group-hover:invisible"
        />
        <img
          src={`${import.meta.env.BASE_URL}/peepoRun.webp`}
          className="size-4 absolute invisible group-hover:visible"
        />
      </div>

      {/* todo: entities view */}
      {/* todo: string tables view */}
    </div>
  );
}

function DemFileSection() {
  const [demFile, setDemFile] = useAtom(demFileAtom);

  // TODO: get rid of x button and store file history -> allow to switch between
  // files that were open.

  return (
    <div className="flex items-center justify-center gap-x-2">
      {demFile && (
        <>
          <Button size="small" className="invisible" disabled>
            <XIcon className="size-4" />
          </Button>
          <span>{demFile.name}</span>
          <Button size="small" onClick={() => setDemFile(undefined)}>
            <XIcon className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function UiSection() {
  const [darkMode, toggleDarkMode] = useAtom(darkModeAtom);
  useLayoutEffect(() => {
    const classNameInverse = darkMode ? "light" : "dark";
    document.documentElement.classList.remove(classNameInverse);
    const className = darkMode ? "dark" : "light";
    document.documentElement.classList.add(className);
  }, [darkMode]);

  const [fullWidth, toggleFullWidth] = useAtom(fullWidthAtom);

  return (
    <div className="flex items-center justify-end gap-x-1">
      <Tooltip content="source code">
        <Button size="small" asChild>
          <a
            href="https://github.com/blukai/haste-inspector"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon className="size-4" />
          </a>
        </Button>
      </Tooltip>
      <div className="w-px h-4 bg-divider" />
      <Tooltip content={darkMode ? "light mode" : "dark mode"}>
        <Button size="small" onClick={() => toggleDarkMode()}>
          {darkMode ? (
            <SunIcon className="size-4" />
          ) : (
            <MoonIcon className="size-4" />
          )}
        </Button>
      </Tooltip>
      <Tooltip
        content={
          fullWidth ? (
            "narrow mode"
          ) : (
            <div className="flex items-baseline">
              wide mode
              <img
                src={`${import.meta.env.BASE_URL}/widepeepoHappy.webp`}
                className="h-[1em] ml-[1ch]"
              />
            </div>
          )
        }
      >
        <Button size="small" onClick={() => toggleFullWidth()}>
          {fullWidth ? (
            <Minimize2Icon className="size-4 rotate-45" />
          ) : (
            <Maximize2Icon className="size-4 rotate-45" />
          )}
        </Button>
      </Tooltip>
    </div>
  );
}

export default function AppBar() {
  return (
    <div className="shrink-0 grid grid-cols-3 px-1 h-8">
      <IconSection />
      <DemFileSection />
      <UiSection />
    </div>
  );
}
