// !TODO - Will be element

import { RectifyNode } from "@rectify/core";
import { RectifyFiber } from "./RectifyFiberTypes";

type InstanceCurrentFiber = {
  CurrentFiberRoot: RectifyFiber | null;
  ContainerDom: Element | null;
  ScheduledNode: RectifyNode | null;
};

const instance: InstanceCurrentFiber = {
  CurrentFiberRoot: null,
  ContainerDom: null,
  ScheduledNode: null,
};
