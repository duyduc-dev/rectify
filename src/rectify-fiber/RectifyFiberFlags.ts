export type RectifyFiberFlags = number;

export const NoFlags = 0b000000;
export const Placement = 0b000001; // Insert into DOM
export const Update = 0b000010; // Update existing DOM
export const Deletion = 0b000100; // Remove from DOM
