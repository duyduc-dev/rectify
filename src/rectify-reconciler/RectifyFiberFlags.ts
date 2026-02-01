export const enum RectifyFiberFlags {
  None /*       */ = 0,
  Placement /*  */ = 1 << 0,
  Update /*     */ = 1 << 1,
  Deletion /*   */ = 1 << 2,
}

export const hasFlag = (flags: RectifyFiberFlags, flag: RectifyFiberFlags) =>
  (flags & flag) !== 0;

export const addFlag = (flags: RectifyFiberFlags, flag: RectifyFiberFlags) =>
  flags | flag;

export const removeFlag = (flags: RectifyFiberFlags, flag: RectifyFiberFlags) =>
  flags & ~flag;
