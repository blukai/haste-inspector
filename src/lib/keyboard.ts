import { isMac } from "./platform";

export function isCtrlOrCmdActive(ev: React.KeyboardEvent | KeyboardEvent) {
  return (!isMac() && ev.ctrlKey) || (isMac() && ev.metaKey);
}
