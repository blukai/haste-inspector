import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAtom } from "jotai";
import { CheckIcon, CogIcon, Link2Icon, Link2OffIcon } from "lucide-react";
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
import { type EntityLi, handleToIndex, isHandleValid } from "./lib/haste";
import { cn } from "./lib/style";

const LI_HEIGHT = 26;

const DEFAULT_SHOW_ENTITY_INDEX = false;

const DEFAULT_SHOW_FIELD_ENCODED_TYPE = true;
const DEFAULT_SHOW_FIELD_DECODED_TYPE = false;
const DEFAULT_SHOW_FIELD_PATH = false;

type DropdownMenuCheckboxItemProps = Pick<
  DropdownMenuPrimitive.DropdownMenuCheckboxItemProps,
  "checked" | "onCheckedChange"
> & {
  label: React.ReactNode;
};

function DropdownMenuCheckboxItem(props: DropdownMenuCheckboxItemProps) {
  const { checked, onCheckedChange, label } = props;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="flex items-center hover:bg-neutral-500/40 rounded px-2 py-0.5 gap-x-2 cursor-pointer"
    >
      <DropdownMenuPrimitive.ItemIndicator forceMount>
        <CheckIcon className={cn("size-4", !checked && "invisible")} />
      </DropdownMenuPrimitive.ItemIndicator>
      {label}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

type EntityListPreferencesProps = {
  showEntityIndex: boolean;
  setShowEntityIndex: (value: boolean) => void;
};

// NOTE: keep this in sync with EntityFieldListPreferences
function EntityListPreferences(props: EntityListPreferencesProps) {
  const {
    showEntityIndex,
    setShowEntityIndex,
  } = props;

  const [open, setOpen] = useState(false);

  const active = open;

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
          // NOTE: following classes are stolen from tooltip
          className="bg-white dark:bg-black rounded z-10"
        >
          <DropdownMenuCheckboxItem
            checked={showEntityIndex}
            onCheckedChange={setShowEntityIndex}
            label="entity index"
          />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

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
      const entityIndex = +ev.currentTarget.dataset.entidx!;
      if (entityIndex >= 0 && entityIndex <= Number.MAX_SAFE_INTEGER) {
        setDemSelectedEntityIndex((prevEntityIndex) =>
          prevEntityIndex === entityIndex ? undefined : entityIndex,
        );
      }
    },
    [setDemSelectedEntityIndex],
  );

  const [showEntityIndex, setShowEntityIndex] = useState(DEFAULT_SHOW_ENTITY_INDEX);

  return (
    <div className="w-full h-full flex flex-col">
      <DemFilterBar
        entries={entityList}
        onUpdate={handleFilterUpdate}
        placehoder="filter entities…"
        endAdornment={
          <>
            <div className="w-px h-4 bg-divider" />
            <EntityListPreferences
              showEntityIndex={showEntityIndex}
              setShowEntityIndex={setShowEntityIndex}
            />
          </>
        }
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
                  "absolute top-0 left-0 w-full px-2 flex items-center cursor-pointer text-fg-subtle hover:bg-neutral-500/40",
                  entitySelected && "bg-neutral-500/60 text-fg",
                )}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                data-entidx={entityItem?.index}
                onClick={handleClick}
              >
                {showEntityIndex && (
                  <span
                    className="text-fg-subtle opacity-40 text-end mr-2"
                    style={{ minWidth: "4ch" }}
                  >
                    {entityItem.index}
                  </span>
                )}
                <span className="text-ellipsis overflow-hidden whitespace-nowrap">
                  {entityItem.name}
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
  showFieldPath: boolean;
  setShowFieldPath: (value: boolean) => void;
  showFieldEncodedType: boolean;
  setShowFieldEncodedType: (value: boolean) => void;
  showFieldDecodedType: boolean;
  setShowFieldDecodedType: (value: boolean) => void;
};

// NOTE: keep this in sync with EntityListPreferences
function EntityFieldListPreferences(props: EntityFieldListPreferencesProps) {
  const {
    showFieldPath,
    setShowFieldPath,
    showFieldEncodedType,
    setShowFieldEncodedType,
    showFieldDecodedType,
    setShowFieldDecodedType,
  } = props;

  const [open, setOpen] = useState(false);

  const active = open;

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
          // NOTE: following classes are stolen from tooltip
          className="bg-white dark:bg-black rounded z-10"
        >
          <DropdownMenuCheckboxItem
            checked={showFieldPath}
            onCheckedChange={setShowFieldPath}
            label="field path"
          />
          <DropdownMenuCheckboxItem
            checked={showFieldEncodedType}
            onCheckedChange={setShowFieldEncodedType}
            label="encoded type"
          />
          <DropdownMenuCheckboxItem
            checked={showFieldDecodedType}
            onCheckedChange={setShowFieldDecodedType}
            label="decoded type"
          />
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

function EntityFieldList() {
  const [demParser] = useAtom(demParserAtom);
  const [demTick] = useAtom(demTickAtom);
  const [demSelectedEntityIndex] = useAtom(demSelectedEntityIndexAtom);

  const { entityFieldList, joinedPathMaxLen } = useMemo(() => {
    demTick; // trick eslint

    if (demSelectedEntityIndex === undefined) {
      return {};
    }

    let joinedPathMaxLen = 0;

    const entityFieldList = demParser
      ?.listEntityFields(demSelectedEntityIndex)
      ?.map((entityField) => {
        const joinedPath = Array.from(entityField.path)
          .map((part) => part.toString().padStart(4, " "))
          .join("");
        joinedPathMaxLen = Math.max(joinedPathMaxLen, joinedPath.length);
        return {
          inner: entityField,
          joinedPath,
          joinedNamedPath: entityField.namedPath.join("."),
        };
      });

    entityFieldList?.sort((a, b) => {
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

    return { entityFieldList, joinedPathMaxLen };
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

  const [showFieldEncodedType, setShowFieldEncodedType] = useState(
    DEFAULT_SHOW_FIELD_ENCODED_TYPE,
  );
  const [showFieldDecodedType, setShowFieldDecodedType] = useState(
    DEFAULT_SHOW_FIELD_DECODED_TYPE,
  );
  const [showFieldPath, setShowFieldPath] = useState(DEFAULT_SHOW_FIELD_PATH);

  const [, setDemSelectedEntityIndex] = useAtom(demSelectedEntityIndexAtom);
  const handleClick = useCallback(
    (ev: React.MouseEvent<HTMLLIElement>) => {
      const entityIndex = +ev.currentTarget.dataset.entidx!;
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
        entries={entityFieldList}
        onUpdate={handleFilterUpdate}
        updateDelay={10}
        placehoder="filter entity fields…"
        endAdornment={
          <>
            <div className="w-px h-4 bg-divider" />
            <EntityFieldListPreferences
              showFieldEncodedType={showFieldEncodedType}
              setShowFieldEncodedType={setShowFieldEncodedType}
              showFieldDecodedType={showFieldDecodedType}
              setShowFieldDecodedType={setShowFieldDecodedType}
              showFieldPath={showFieldPath}
              setShowFieldPath={setShowFieldPath}
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

            const handle =
              entityFieldItem.inner.encodedAs.startsWith("CHandle");
            const handleValid =
              handle && isHandleValid(+entityFieldItem.inner.value);
            const linkedEntIdx = handleValid
              ? handleToIndex(+entityFieldItem.inner.value)
              : null;

            return (
              <li
                key={virtualItem.key}
                className={cn(
                  "absolute top-0 left-0 w-full px-2 flex items-center hover:bg-neutral-500/20",
                  handleValid && "cursor-pointer hover:bg-neutral-500/40",
                )}
                style={{
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                data-entidx={linkedEntIdx}
                onClick={handleClick}
              >
                <span className="whitespace-nowrap gap-x-[1ch] flex items-center">
                  {showFieldPath && (
                    <span
                      className="text-fg-subtle opacity-40 whitespace-pre mr-2"
                      style={{ width: `${joinedPathMaxLen}ch` }}
                    >
                      {entityFieldItem.joinedPath}
                    </span>
                  )}
                  <span className="text-fg-subtle">
                    {entityFieldItem.joinedNamedPath}
                  </span>
                  <span className="text-fg-subtle opacity-40 -ml-2">:</span>
                  {(showFieldEncodedType || showFieldDecodedType) && (
                    <>
                      {showFieldEncodedType && (
                        <span className="text-fg-subtle opacity-40">
                          {entityFieldItem.inner.encodedAs || "_"}
                        </span>
                      )}
                      {showFieldEncodedType && showFieldDecodedType && (
                        <span className="text-fg-subtle opacity-40">
                          {"->"}
                        </span>
                      )}
                      {showFieldDecodedType && (
                        <span className="text-fg-subtle opacity-40">
                          {entityFieldItem.inner.decodedAs}
                        </span>
                      )}
                    </>
                  )}
                  <span>{entityFieldItem.inner.value}</span>
                  {handle &&
                    (handleValid ? (
                      <Tooltip content="click to navigate to the linked entity">
                        <Link2Icon className="size-4" />
                      </Tooltip>
                    ) : (
                      <Tooltip content="this handle is invalid">
                        <Link2OffIcon className="size-4 text-fg-subtle" />
                      </Tooltip>
                    ))}
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
