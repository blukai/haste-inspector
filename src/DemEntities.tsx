import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom } from "jotai";
import { CheckIcon, CogIcon } from "lucide-react";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import DemFilterBar, { type UpdateEventHandler } from "./DemFilterBar";
import {
  demParserAtom,
  demSelectedEntityIndexAtom,
  demTickAtom,
} from "./atoms";
import { Button } from "./lib/Button";
import { ScrollArea } from "./lib/ScrollArea";
import { Tooltip } from "./lib/Tooltip";
import { type EntityLi } from "./lib/haste";
import { cn } from "./lib/style";

const LI_HEIGHT = 26;
const DEFAULT_SHOW_TYPE_INFO = true;

function EntityList() {
  const [demParser] = useAtom(demParserAtom);
  const [demTick] = useAtom(demTickAtom);
  const entityList = useMemo(() => {
    demTick; // trick eslint
    return demParser?.listEntities();
  }, [demParser, demTick]);

  const [, startTransition] = useTransition();
  const [filteredEntityList, setFinalEntityList] = useState(entityList);
  const handleFilterUpdate: UpdateEventHandler<EntityLi> = useCallback(
    (entries, searchCmpFn) => {
      startTransition(() => {
        if (searchCmpFn) {
          setFinalEntityList(
            entries?.filter((entry) => searchCmpFn(entry.name)),
          );
        } else {
          setFinalEntityList(entries);
        }
      });
    },
    [],
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredEntityList?.length ?? 0,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => LI_HEIGHT,
  });

  const [demSelectedEntityIndex, setDemSelectedEntityIndex] = useAtom(
    demSelectedEntityIndexAtom,
  );
  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLLIElement>) => {
      const entityIndex = +ev.currentTarget.dataset.ei!;
      if (entityIndex >= 0 && entityIndex <= Number.MAX_SAFE_INTEGER) {
        setDemSelectedEntityIndex((prevEntityIndex) =>
          prevEntityIndex === entityIndex ? undefined : entityIndex,
        );
      }
    },
    [setDemSelectedEntityIndex],
  );

  return (
    <div className="w-full h-full flex flex-col">
      <DemFilterBar
        entries={entityList}
        onUpdate={handleFilterUpdate}
        placehoder="filter entities…"
        className="border-b border-divider"
      />
      {!entityList?.length && (
        <p className="m-2 text-fg-subtle">no entities, try moving the slider</p>
      )}
      <ScrollArea className="w-full grow" viewportRef={viewportRef}>
        <ul
          className="w-full h-full relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entityItem = filteredEntityList![virtualItem.index];
            const entitySelected = demSelectedEntityIndex === entityItem?.index;
            return (
              <li
                key={virtualItem.key}
                className={cn(
                  "absolute top-0 left-0 w-full px-2 flex items-center cursor-pointer text-fg-subtle hover:bg-neutral-500/30",
                  entitySelected && "bg-neutral-500/30 text-fg",
                )}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                data-ei={entityItem?.index}
                onClick={handleClick}
              >
                <span className="text-ellipsis overflow-hidden whitespace-nowrap">
                  {entityItem?.name}
                </span>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}

type EntityFieldListPreferencesProps = {
  showTypeInfo: boolean;
  setShowTypeInfo: (value: boolean) => void;
};

function EntityFieldListPreferences(props: EntityFieldListPreferencesProps) {
  const { showTypeInfo, setShowTypeInfo } = props;

  const [open, setOpen] = useState(false);

  const active = open || showTypeInfo;

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <span className="inline-flex">
          <Tooltip content="display preferences">
            <Button size="small" className={cn(active && "bg-neutral-500/30")}>
              <CogIcon
                className={cn("size-4", !active && "stroke-fg-subtle")}
              />
            </Button>
          </Tooltip>
        </span>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          // NOTE: following classes are stole from tooltip
          className="bg-white dark:bg-black rounded z-10"
        >
          <DropdownMenuPrimitive.CheckboxItem
            checked={showTypeInfo}
            onCheckedChange={setShowTypeInfo}
            className="flex items-center hover:bg-neutral-500/30 rounded px-2 py-0.5 gap-x-2 cursor-pointer"
          >
            <DropdownMenuPrimitive.ItemIndicator>
              <CheckIcon className="size-4" />
            </DropdownMenuPrimitive.ItemIndicator>
            show type info
          </DropdownMenuPrimitive.CheckboxItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

function EntityFieldList() {
  const [demParser] = useAtom(demParserAtom);
  const [demTick] = useAtom(demTickAtom);
  const [demSelectedEntityIndex] = useAtom(demSelectedEntityIndexAtom);
  const entityFieldList = useMemo(() => {
    demTick; // trick eslint

    if (demSelectedEntityIndex === undefined) {
      return undefined;
    }

    const efl = demParser
      ?.listEntityFields(demSelectedEntityIndex)
      ?.map((entityField) => ({
        inner: entityField,
        joinedNamedPath: entityField.namedPath.join("."),
      }));

    efl?.sort((a, b) => {
      // compare path arrays element by element
      for (
        let i = 0;
        i < Math.min(a.inner.path.length, b.inner.path.length);
        i++
      ) {
        if (a.inner.path[i] !== b.inner.path[i]) {
          return a.inner.path[i] - b.inner.path[i];
        }
      }
      // if the paths are equal up to the minimum length, the shorter path
      // comes first
      return a.inner.path.length - b.inner.path.length;
    });

    return efl;
  }, [demSelectedEntityIndex, demParser, demTick]);

  type WrappedEntityFieldLi = NonNullable<typeof entityFieldList>[0];

  const [, startTransition] = useTransition();
  const [filteredEntityFieldList, setFinalEntityFieldList] =
    useState(entityFieldList);
  const handleFilterUpdate: UpdateEventHandler<WrappedEntityFieldLi> =
    useCallback((entries, searchCmpFn) => {
      startTransition(() => {
        if (searchCmpFn) {
          setFinalEntityFieldList(
            entries?.filter((entry) => searchCmpFn(entry.joinedNamedPath)),
          );
        } else {
          setFinalEntityFieldList(entries);
        }
      });
    }, []);

  const viewportRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredEntityFieldList?.length ?? 0,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => LI_HEIGHT,
  });

  const [showTypeInfo, setShowTypeInfo] = useState(DEFAULT_SHOW_TYPE_INFO);

  return (
    <div className="w-full h-full flex flex-col">
      <DemFilterBar
        entries={entityFieldList}
        onUpdate={handleFilterUpdate}
        updateDelay={10}
        placehoder="filter entity fields…"
        endAdornment={
          <>
            <div className="w-px h-4 bg-divider" />
            <EntityFieldListPreferences
              showTypeInfo={showTypeInfo}
              setShowTypeInfo={setShowTypeInfo}
            />
          </>
        }
        className="border-b border-divider"
      />
      {demSelectedEntityIndex === undefined && (
        <p className="m-2 text-fg-subtle">
          to view entity fields, select an entity from the list of entities
        </p>
      )}
      {demSelectedEntityIndex !== undefined && !entityFieldList?.length && (
        <p className="m-2 text-fg-subtle">
          the previously selected entity does not exist at the current tick
        </p>
      )}
      <ScrollArea className="w-full grow" viewportRef={viewportRef}>
        <ul
          className="w-full h-full relative"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entityFieldItem = filteredEntityFieldList![virtualItem.index];
            return (
              <li
                key={virtualItem.key}
                className={cn(
                  "absolute top-0 left-0 w-full px-2 flex items-center cursor-pointer hover:bg-neutral-500/30",
                )}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <span className="whitespace-nowrap gap-x-[1ch] flex">
                  <span className="text-fg-subtle">
                    {entityFieldItem.joinedNamedPath}
                  </span>
                  <span className="text-fg-subtle opacity-40 -ml-2">:</span>
                  {showTypeInfo && (
                    <>
                      <span className="text-fg-subtle opacity-40">
                        {entityFieldItem.inner.encodedAs}
                      </span>
                      <span className="text-fg-subtle opacity-40">{"->"}</span>
                      <span className="text-fg-subtle opacity-40">
                        {entityFieldItem.inner.decodedAs}
                      </span>
                    </>
                  )}
                  <span>{entityFieldItem.inner.value}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}

export default function DemEntities() {
  return (
    <div className="grow h-0">
      <PanelGroup direction="horizontal">
        <Panel minSize={24} defaultSize={24}>
          <EntityList />
        </Panel>
        <PanelResizeHandle className="w-px h-full bg-divider data-[resize-handle-state=hover]:bg-current data-[resize-handle-state=drag]:bg-current" />
        <Panel minSize={24}>
          <EntityFieldList />
        </Panel>
      </PanelGroup>
    </div>
  );
}
