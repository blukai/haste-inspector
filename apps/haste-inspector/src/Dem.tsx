import initHaste, { WrappedParser } from "haste-wasm";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import DemEntities from "./DemEntities";
import DemLayout from "./DemLayout";
import DemStringTables from "./DemStringTables";
import { demFileAtom, demParserAtom, demTickAtom, demViewAtom } from "./atoms";
import { Tooltip } from "./lib/Tooltip";

function readFileToBytes(file: File) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (fileReader.result instanceof ArrayBuffer) {
        resolve(new Uint8Array(fileReader.result));
      } else {
        reject(new Error("invalid result"));
      }
    };
    fileReader.onerror = () => {
      reject(fileReader.error);
    };
    fileReader.readAsArrayBuffer(file);
  });
}

export default function Dem() {
  const [demFile] = useAtom(demFileAtom);
  const [demParser, setDemParser] = useAtom(demParserAtom);
  const [demView] = useAtom(demViewAtom);
  const [, setDemTick] = useAtom(demTickAtom);

  const [doingWhat, setDoingWhat] = useState("zzz");
  const [initError, setInitError] = useState<unknown>();
  useEffect(() => {
    const asyncFn = async () => {
      try {
        setDoingWhat("initializing web assembly");
        await initHaste();

        setDoingWhat("loading file into memory");
        const fileBytes = await readFileToBytes(demFile!);

        setDoingWhat("constructing parser");
        const parser = new WrappedParser(fileBytes);

        setDoingWhat("seeking to last tick");
        parser.runToTick(parser.totalTicks());

        setDemParser(parser);
        setDemTick(parser.tick());
      } catch (error) {
        setInitError(error);
      }
    };
    asyncFn();
  }, [demFile, setDemParser, setDemTick]);

  if (!demParser) {
    if (initError) {
      return (
        <div className="p-2 flex items-baseline">
          <Tooltip content="monkaW">
            <img
              src={`${import.meta.env.BASE_URL}/monkaW.webp`}
              className="h-[1em] mr-[1ch]"
            />
          </Tooltip>
          <span className="text-red-500">{`${initError}`}</span>
        </div>
      );
    }
    return (
      <div className="p-2 flex items-baseline">
        <Tooltip content="borpaSpin">
          <img
            src={`${import.meta.env.BASE_URL}/borpaSpin.webp`}
            className="h-[1em] mr-[1ch]"
          />
        </Tooltip>
        <span className="text-neutral-400">{`${doingWhat}…`}</span>
      </div>
    );
  }

  return (
    <DemLayout>
      {(demView === "entities" || demView === "baselineEntities") && (
        <DemEntities />
      )}
      {demView === "stringTables" && <DemStringTables />}
    </DemLayout>
  );
}
