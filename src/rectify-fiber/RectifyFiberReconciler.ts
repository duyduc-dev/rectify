import { RectifyNode } from "@rectify/core";
import { createFiberRoot } from "./RectifyFiberRoot";
import { FiberRoot } from "./RectifyFiberTypes";
import { createRectifyFiberBuilder } from "./RectifyFiber";
import { setScheduleUpdateOnFiber } from "@rectify/rectify-hook/RectifyHook";
import { completeFiberStage } from "./RectifyFiberStages/RectifyFiberCompleteFiber";
import { commitFiberStage } from "./RectifyFiberStages/RectifyFiberCommitFiber";
import { getHostRootFiber } from "./RectifyFiberUtilities";
import { syncFiberStage } from "./RectifyFiberStages/RectifyFiberSyncFiber";

const registerSchduleUpdateOnFiber = () => {
  setScheduleUpdateOnFiber((fiber) => {
    const hostRoot = getHostRootFiber(fiber);
    if (!hostRoot) return;
    const fiberBuilder = createRectifyFiberBuilder(hostRoot, hostRoot.props);
    syncFiberStage(fiberBuilder);
    completeFiberStage(fiberBuilder);
    commitFiberStage(fiberBuilder);
    if (hostRoot.root) {
      hostRoot.root.current = fiberBuilder;
    }
    fiberBuilder.root = hostRoot.root;
    console.log(">> setScheduleUpdateOnFiber", {
      hostRoot,
      fiberBuilder,
    });
  });
};

export const createContainer = (container: Element) => {
  const root = createFiberRoot(container);
  registerSchduleUpdateOnFiber();
  return root;
};

export const updateContainer = (children: RectifyNode, root: FiberRoot) => {
  const current = root.current;
  const fiberBuilder = createRectifyFiberBuilder(current, { children });
  syncFiberStage(fiberBuilder);
  completeFiberStage(fiberBuilder);
  commitFiberStage(fiberBuilder);
  root.current = fiberBuilder;
  fiberBuilder.root = root;
};
