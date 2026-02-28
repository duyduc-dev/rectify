import { createRectifyIdInstance } from "./unique";

const RECTIFY_PREFIX = "__rectify__element__";

const { createId: createRectifyElementId } =
  createRectifyIdInstance(RECTIFY_PREFIX);

export { createRectifyElementId };
