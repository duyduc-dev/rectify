import { RectifyNode } from "@rectify/core";
import {
  createContainer,
  updateContainer,
} from "@rectify/rectify-reconciler/RectifyFiberReconciler";

/**
 * @param container
 * @returns
 */
const createRoot = (container: Element) => {
  const fiberRoot = createContainer(container);

  return {
    render: (element: RectifyNode) => {
      updateContainer(element, fiberRoot);
    },
    unmount: () => {},
  };
};

export { createRoot };
