import { RectifyNode } from "@rectify/core";
import { listenAllEventSupported } from "@rectify/rectify-dom-binding/events/RectifyEventHandler";
import {
  createContainer,
  updateContainer,
} from "@rectify/rectify-fiber/RectifyFiberReconciler";
import { FiberRoot } from "@rectify/rectify-fiber/RectifyFiberTypes";

class RectifyDomRoot {
  constructor(private fiberRoot: FiberRoot) {}

  render(node: RectifyNode) {
    const root = this.fiberRoot;
    updateContainer(node, root);
  }
}

export const createRoot = (container: Element) => {
  const root = createContainer(container);
  listenAllEventSupported(container);
  return new RectifyDomRoot(root);
};
