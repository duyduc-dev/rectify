export type RectifyFiberWorkTag =
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText
  | typeof FunctionComponent;

export const HostRoot = 0;
export const HostComponent = 1;
export const HostText = 2;
export const FunctionComponent = 3;
