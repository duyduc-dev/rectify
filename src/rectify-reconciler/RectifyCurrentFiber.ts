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

export const setCurrentFiberRoot = (fiber: RectifyFiber | null) => {
  instance.CurrentFiberRoot = fiber;
};
export const getCurrentFiberRoot = () => {
  return instance.CurrentFiberRoot;
};

export const getContainerDom = () => {
  return instance.ContainerDom;
};
export const setContainerDom = (containerDom: Element | null) => {
  instance.ContainerDom = containerDom;
};

export const setScheduledNode = (scheduledNode: RectifyNode | null) => {
  instance.ScheduledNode = scheduledNode;
};
export const getScheduledNode = () => {
  return instance.ScheduledNode;
};
