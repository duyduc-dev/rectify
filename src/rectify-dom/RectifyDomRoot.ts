import {
  createContainer,
  updateContainer,
} from "@rectify/rectify-reconciler/RectifyFiberReconciler";
import { RectifyNode } from "@rectify/rectify/RectifyTypes";
import { listenAllSupportedEvents } from "./events/RectifyDomEventsSystem";

export const render = (children: RectifyNode, container: Element) => {
  const root = createContainer(children, container);
  listenAllSupportedEvents(container);
  updateContainer(root);
};
