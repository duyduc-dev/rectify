import { setDOMProperties } from "@rectify/rectify-dom-binding/events/RectifyEventPlugin";
import { isText, isPlainObject } from "@rectify/shared/utilities";
import { HostComponent, HostText, HostRoot } from "../RectifyFiberTags";
import { Fiber } from "../RectifyFiberTypes";

export const completeFiberStage = (fiberBuilder: Fiber) => {
  switch (fiberBuilder.tag) {
    case HostComponent:
      completeFiberHostComponent(fiberBuilder);
      break;
    case HostText:
      completeFiberHostText(fiberBuilder);
      break;
    case HostRoot: {
      // Root already has stateNode = container
      break;
    }
    default:
      break;
  }

  let child = fiberBuilder.firstChild;
  while (child) {
    completeFiberStage(child);
    child = child.sibling;
  }
};

const completeFiberHostComponent = (fiberBuilder: Fiber) => {
  const current = fiberBuilder.alternate;

  if (current) {
    fiberBuilder.stateNode = current.stateNode;
    return;
  }
  if (!isText(fiberBuilder.type)) {
    return;
  }
  const type = fiberBuilder.type;
  const instance = document.createElement(type);
  fiberBuilder.stateNode = instance;
  setDOMProperties(instance, fiberBuilder.props);
};

const completeFiberHostText = (fiberBuilder: Fiber) => {
  const current = fiberBuilder.alternate;

  if (current) {
    fiberBuilder.stateNode = current.stateNode;
    return;
  }
  const instance = document.createTextNode(
    String(isPlainObject(fiberBuilder.props) ? "" : fiberBuilder.props),
  );

  fiberBuilder.stateNode = instance;
};
