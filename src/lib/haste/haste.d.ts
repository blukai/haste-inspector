/* tslint:disable */
/* eslint-disable */
/**
*/
export class EntityFieldLi {
  free(): void;
/**
*/
  decodedAs: string;
/**
*/
  encodedAs: string;
/**
*/
  namedPath: (string)[];
/**
*/
  path: Uint8Array;
/**
*/
  value: string;
}
/**
*/
export class EntityLi {
  free(): void;
/**
*/
  index: number;
/**
*/
  name: string;
}
/**
*/
export class WrappedParser {
  free(): void;
/**
* @param {Uint8Array} bytes
*/
  constructor(bytes: Uint8Array);
/**
* @returns {number}
*/
  tick(): number;
/**
* @returns {number}
*/
  totalTicks(): number;
/**
* @param {number} tick
*/
  runToTick(tick: number): void;
/**
* @returns {(EntityLi)[] | undefined}
*/
  listEntities(): (EntityLi)[] | undefined;
/**
* @param {number} entity_index
* @returns {(EntityFieldLi)[] | undefined}
*/
  listEntityFields(entity_index: number): (EntityFieldLi)[] | undefined;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_wrappedparser_free: (a: number) => void;
  readonly __wbg_entityli_free: (a: number) => void;
  readonly __wbg_get_entityli_index: (a: number) => number;
  readonly __wbg_set_entityli_index: (a: number, b: number) => void;
  readonly __wbg_get_entityli_name: (a: number, b: number) => void;
  readonly __wbg_entityfieldli_free: (a: number) => void;
  readonly __wbg_get_entityfieldli_path: (a: number, b: number) => void;
  readonly __wbg_set_entityfieldli_path: (a: number, b: number, c: number) => void;
  readonly __wbg_get_entityfieldli_namedPath: (a: number, b: number) => void;
  readonly __wbg_set_entityfieldli_namedPath: (a: number, b: number, c: number) => void;
  readonly __wbg_get_entityfieldli_value: (a: number, b: number) => void;
  readonly __wbg_set_entityfieldli_value: (a: number, b: number, c: number) => void;
  readonly __wbg_get_entityfieldli_encodedAs: (a: number, b: number) => void;
  readonly __wbg_set_entityfieldli_encodedAs: (a: number, b: number, c: number) => void;
  readonly __wbg_get_entityfieldli_decodedAs: (a: number, b: number) => void;
  readonly __wbg_set_entityfieldli_decodedAs: (a: number, b: number, c: number) => void;
  readonly wrappedparser_fromBytes: (a: number, b: number, c: number) => void;
  readonly wrappedparser_tick: (a: number) => number;
  readonly wrappedparser_totalTicks: (a: number, b: number) => void;
  readonly wrappedparser_runToTick: (a: number, b: number, c: number) => void;
  readonly wrappedparser_listEntities: (a: number, b: number) => void;
  readonly wrappedparser_listEntityFields: (a: number, b: number, c: number) => void;
  readonly __wbg_set_entityli_name: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
