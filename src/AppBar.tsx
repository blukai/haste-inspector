import { useAtom } from "jotai";
import {
  ChevronDownIcon,
  GithubIcon,
  Maximize2Icon,
  Minimize2Icon,
  MoonIcon,
  SlashIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { darkModeAtom, demFileAtom, demViewAtom, fullWidthAtom } from "./atoms";
import { Button } from "./lib/Button";
import * as DropdownMenu from "./lib/DropdownMenu";
import { Tooltip } from "./lib/Tooltip";
import { cn } from "./lib/style";

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

function DemViewSelection() {
  const [demView, setDemView] = useAtom(demViewAtom);
  const [demViewOpen, setDemViewOpen] = useState(false);

  return (
    <DropdownMenu.Root open={demViewOpen} onOpenChange={setDemViewOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          size="small"
          className={cn("px-2", demViewOpen && "bg-neutral-500/30")}
        >
          {demView === "entities" && "entities"}
          {demView === "baselineEntities" && "baseline entities"}
          {demView === "stringTables" && "string tables"}
          <ChevronDownIcon className={cn("size-3 stroke-fg-subtle ml-2")} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          // NOTE: following classes are stolen from tooltip
          className="bg-white dark:bg-black rounded z-10"
        >
          <DropdownMenu.CheckboxItem
            checked={demView === "entities"}
            onCheckedChange={(_value) => setDemView("entities")}
          >
            entities
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={demView === "baselineEntities"}
            onCheckedChange={(_value) => setDemView("baselineEntities")}
          >
            baseline entities
          </DropdownMenu.CheckboxItem>
          <DropdownMenu.CheckboxItem
            checked={demView === "stringTables"}
            onCheckedChange={(_value) => setDemView("stringTables")}
          >
            string tables
          </DropdownMenu.CheckboxItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function DemFileSection() {
  const [demFile, setDemFile] = useAtom(demFileAtom);

  // TODO: get rid of x button and store file history -> allow to switch between
  // files that were open.

  return (
    <div className="flex items-center gap-x-1 border-l border-l-divider pl-2">
      {demFile && (
        <>
          <div className="flex items-center gap-x-1">
            <span>{demFile.name}</span>
            <Button size="small" onClick={() => setDemFile(undefined)}>
              <XIcon className="size-3 stroke-fg-subtle" />
            </Button>
          </div>
          <SlashIcon className="size-3 text-divider" />
          <DemViewSelection />
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
    <div className="shrink-0 grid grid-cols-[auto_1fr_auto] px-1 h-8">
      <IconSection />
      <DemFileSection />
      <UiSection />
    </div>
  );
}
