import { CaseSensitiveIcon, RegexIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./lib/Button";
import { Tooltip } from "./lib/Tooltip";
import { debounce } from "./lib/debounce";
import { cn } from "./lib/style";
import { useEventCallback } from "./lib/useEventCallback";

export type SearchCmpFn = (value: string) => boolean;
export type UpdateEventHandler<Entry> = (
  entries: Entry[] | undefined,
  searchCmpFn: SearchCmpFn | undefined,
) => void;

function getSearchCmpFn(
  searchQuery: string,
  matchCase: boolean,
  testRegex: boolean,
): SearchCmpFn | undefined {
  if (!searchQuery) {
    return undefined;
  }

  let finalSearchQuery = searchQuery;
  if (!matchCase) {
    finalSearchQuery = searchQuery.toLowerCase();
  }

  if (testRegex) {
    // maybe regex is invalid
    try {
      const regex = new RegExp(finalSearchQuery, matchCase ? undefined : "i");
      return regex.test.bind(regex);
    } catch (error) {
      return undefined;
    }
  }

  return (value) => {
    let finalValue = value;
    if (!matchCase) {
      finalValue = finalValue.toLowerCase();
    }
    return finalValue.includes(finalSearchQuery);
  };
}

type DemFilterBarProps<Entry> = {
  entries: Entry[] | undefined;
  onUpdate: UpdateEventHandler<Entry>;
  updateDelay?: number;
  placehoder?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export default function DemFilterBar<Entry>(props: DemFilterBarProps<Entry>) {
  const {
    entries,
    onUpdate,
    updateDelay,
    placehoder,
    className,
    ...restProps
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [testRegex, setTestRegex] = useState(false);
  const [regexError, setRegexError] = useState<unknown | undefined>(undefined);

  const applyUpdate = useEventCallback(() => {
    const searchQueryCmpFn = getSearchCmpFn(searchQuery, matchCase, testRegex);
    onUpdate(entries, searchQueryCmpFn);
  });

  const firstRenderRef = useRef(true);
  useEffect(() => {
    entries; // trick eslint
    if (!firstRenderRef.current) {
      applyUpdate();
    }
  }, [applyUpdate, entries]);
  firstRenderRef.current = false;

  const applyUpdateDebounced = useMemo(
    () => debounce(applyUpdate, updateDelay),
    [applyUpdate, updateDelay],
  );
  useEffect(() => applyUpdateDebounced.clear, [applyUpdateDebounced]);

  const maybeUpdateRegexError = useCallback(
    (nextTestRegex: boolean, nextSearchQuery: string) => {
      if (!nextTestRegex) {
        setRegexError(undefined);
        return;
      }
      try {
        new RegExp(nextSearchQuery);
        setRegexError(undefined);
      } catch (error) {
        setRegexError(error);
      }
    },
    [],
  );

  const handleSearchQueryChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      const nextSearchQuery = ev.currentTarget.value;
      setSearchQuery(nextSearchQuery);
      maybeUpdateRegexError(testRegex, nextSearchQuery);
      applyUpdateDebounced();
    },
    [maybeUpdateRegexError, testRegex, applyUpdateDebounced],
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const handleMatchCaseClick = () => {
    setMatchCase((prev: boolean) => !prev);
    searchInputRef.current?.focus();
    applyUpdateDebounced();
  };
  const handleTestRegexClick = () => {
    const nextTestRegex = !testRegex;
    setTestRegex(nextTestRegex);
    searchInputRef.current?.focus();
    maybeUpdateRegexError(nextTestRegex, searchQuery);
    applyUpdateDebounced();
  };

  return (
    <div
      className={cn(
        "w-full shrink-0 h-8 relative flex items-center",
        !entries?.length && "*:pointer-events-none *:opacity-50",
        className,
      )}
      {...restProps}
    >
      <input
        ref={searchInputRef}
        placeholder={placehoder}
        className={cn(
          "w-full h-full pl-2 pr-16 bg-transparent -outline-offset-1",
          !!regexError && "outline outline-1 outline-red-500",
        )}
        value={searchQuery}
        onChange={handleSearchQueryChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <Tooltip content="match case">
        <Button
          size="small"
          className={cn(
            "absolute right-0 mr-8",
            matchCase && "bg-neutral-500/30",
          )}
          onClick={handleMatchCaseClick}
        >
          <CaseSensitiveIcon
            className={cn("size-4", !matchCase && "stroke-fg-subtle")}
          />
        </Button>
      </Tooltip>
      <Tooltip content="use regex">
        <Button
          size="small"
          className={cn(
            "absolute right-0 mr-1",
            testRegex && "bg-neutral-500/30",
          )}
          onClick={handleTestRegexClick}
        >
          <RegexIcon
            className={cn("size-4", !testRegex && "stroke-fg-subtle")}
          />
        </Button>
      </Tooltip>
      {!!regexError && (
        <p className="absolute top-full bg-red-900 border border-1 border-t-0 border-red-500 z-10 px-2 py-2 text-sm">
          {`${regexError}`}
        </p>
      )}
    </div>
  );
}
