import { createRectifyFiber } from "./RectifyFiber";
import { HostRoot } from "./RectifyFiberTags";
import { FiberRoot } from "./RectifyFiberTypes";

export const createFiberRoot = (container: Element): FiberRoot => {
  const fiber = createRectifyFiber(HostRoot);

  const root: FiberRoot = {
    current: fiber,
    container,
  };

  fiber.stateNode = container;
  fiber.root = root;

  return root;
};
