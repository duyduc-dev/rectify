import { RectifyElementProps, RectifyNode } from "@rectify/core/RectifyTypes";
import {
  FunctionComponent,
  HostComponent,
  HostText,
  RectifyFiberTags,
} from "./RectifyFiberTags";
import { Fiber } from "./RectifyFiberTypes";
import { NoFlags } from "./RectifyFiberFlags";
import {
  isArray,
  isFunction,
  isPlainObject,
  isText,
} from "@rectify/shared/utilities";

export const createRectifyFiber = (
  tag: RectifyFiberTags,
  props?: RectifyElementProps,
): Fiber => {
  const fiber: Fiber = {
    root: null,
    isAlternate: false,
    tag,
    props,
    key: isPlainObject(props) ? (props.key ?? null) : null,
    memorizedProps: null,
    flags: NoFlags,
    type: null,
    stateNode: null,
    alternate: null,
    return: null,
    firstChild: null,
    sibling: null,
    ref: isPlainObject(props) ? (props.ref ?? null) : null,
    index: 0,
    memorizedHook: null,
  };

  return fiber;
};

export const createRectifyFiberBuilder = (
  current: Fiber,
  props?: RectifyElementProps,
) => {
  let fiberBuilding = current.alternate;

  if (!fiberBuilding) {
    fiberBuilding = createRectifyFiber(current.tag, props);
    fiberBuilding.type = current.type;
    fiberBuilding.stateNode = current.stateNode;

    fiberBuilding.alternate = current;
    current.alternate = fiberBuilding;
  } else {
    fiberBuilding.props = props;
    fiberBuilding.type = current.type;

    // Reset effect flags
    fiberBuilding.flags = NoFlags;
  }

  fiberBuilding.firstChild = current.firstChild;
  fiberBuilding.memorizedProps = current.memorizedProps;
  fiberBuilding.sibling = current.sibling;
  fiberBuilding.index = current.index;
  fiberBuilding.ref = current.ref;
  fiberBuilding.isAlternate = true;

  return fiberBuilding;
};

export const createFiberFromRectifyNode = (node: RectifyNode): Fiber | null => {
  if (isText(node)) {
    return createRectifyFiber(HostText, node);
  }

  if (isPlainObject(node)) {
    const tag = isFunction(node.type) ? FunctionComponent : HostComponent;
    const fiberNode = createRectifyFiber(tag, node.props);
    fiberNode.type = node.type;
    return fiberNode;
  }

  if (isArray(node)) {
    let firstFiber: Fiber | null = null;
    let prevFiber: Fiber | null = null;
    for (let i = 0; i < node.length; i++) {
      const nodeItem = node[i];
      if (!nodeItem) continue;
      const fiber = createFiberFromRectifyNode(nodeItem);
      if (!fiber) continue;
      fiber.index = i;
      if (!firstFiber) {
        firstFiber = fiber;
      } else if (prevFiber) {
        prevFiber.sibling = fiber;
      }
      prevFiber = fiber;
    }
    return firstFiber;
  }
  return null;
};
