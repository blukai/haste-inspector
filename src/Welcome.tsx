import { useAtom } from "jotai";
import {
  FileDigitIcon,
  HandMetalIcon,
  KeyboardIcon,
  MousePointerClickIcon,
} from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { demFileAtom } from "./atoms";
import { isCtrlOrCmdActive } from "./lib/keyboard";
import { isMac } from "./lib/platform";
import { cn } from "./lib/style";

export default function AppWelcome() {
  const [, setDemFile] = useAtom(demFileAtom);

  const { open, getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      multiple: false,
      accept: {
        "": [".dem"],
      },
      onDropAccepted: ([file]) => {
        setDemFile(file);
      },
    });

  React.useEffect(() => {
    const handleKeydown = (ev: KeyboardEvent) => {
      if (isCtrlOrCmdActive(ev) && ev.key === "o") {
        ev.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [open]);

  return (
    <main
      {...getRootProps({
        className: cn(
          "grow flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-500/10 transition-colors",
          isDragAccept && "bg-green-900/10",
          isDragReject && "bg-red-900/10",
        ),
      })}
    >
      <input {...getInputProps()} />
      <p>
        <HandMetalIcon className="inline size-[1em]" /> drag and drop your
        replay (.dem) <FileDigitIcon className="inline size-[1em]" /> file here
      </p>
      <p className="text-neutral-400">
        <small>
          press <KeyboardIcon className="inline size-[1em]" />{" "}
          {isMac() ? "cmd" : "ctrl"} + o or{" "}
          <MousePointerClickIcon className="inline size-[1em]" /> click to
          browse
        </small>
      </p>
    </main>
  );
}
