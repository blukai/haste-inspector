// NOTE: this is partialy stolen from
// https://github.com/chakra-ui/zag/blob/8402375a95ebdb4acb4386c358fb52377fef03ff/packages/utilities/dom-query/src/platform.ts

export const isDom = () => typeof document !== "undefined";

export const getPlatform = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (navigator as any).userAgentData?.platform ?? navigator.platform;

const pt = (v: RegExp) => v.test(getPlatform());

export const isTouchDevice = () => !!navigator.maxTouchPoints;
export const isMac = () => isDom() && pt(/^Mac/) && !isTouchDevice();
