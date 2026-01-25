var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/shared/utilities.ts
function isPlainObject(value) {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}
__name(isPlainObject, "isPlainObject");
var isFunction = /* @__PURE__ */ __name((v) => typeof v === "function", "isFunction");
var isString = /* @__PURE__ */ __name((v) => typeof v === "string", "isString");
var isNumber = /* @__PURE__ */ __name((v) => typeof v === "number", "isNumber");
var isText = /* @__PURE__ */ __name((v) => isNumber(v) || isString(v), "isText");
var isArray = /* @__PURE__ */ __name((v) => Array.isArray(v), "isArray");

// src/core/RectifyConfigs.ts
var RECTIFY_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("rectify.element");

// src/core/RectifyJsx.ts
var RectifyElementJsx = /* @__PURE__ */ __name((type, props) => {
  var _a, _b;
  return {
    $$typeof: RECTIFY_ELEMENT_TYPE,
    type,
    props,
    key: isPlainObject(props) ? (_a = props.key) != null ? _a : null : null,
    ref: isPlainObject(props) ? (_b = props.ref) != null ? _b : null : null
  };
}, "RectifyElementJsx");
var jsx = /* @__PURE__ */ __name((type, props) => {
  return RectifyElementJsx(type, props);
}, "jsx");

// src/rectify-dom-binding/events/RectifyEventHandler.ts
var EVENT_HANDLERS_KEY = "__rectifyEventHandlers__";
var RectifyEventSupported = [
  "click",
  "input",
  "change",
  "keydown",
  "keyup",
  "focus",
  "blur",
  "submit",
  "mousedown",
  "mouseup",
  "mouseover",
  "mouseout",
  "dblclick"
];
var listenAllEventSupported = /* @__PURE__ */ __name((domElement) => {
  RectifyEventSupported.forEach((eventType) => {
    domElement.addEventListener(
      eventType,
      (event) => {
        dispatchEvent(event, domElement);
      },
      false
      // Bubble phase
    );
  });
}, "listenAllEventSupported");
var dispatchEvent = /* @__PURE__ */ __name((event, domElement) => {
  const targetElement = event.target;
  if (!targetElement) return;
  const handlers = targetElement[EVENT_HANDLERS_KEY];
  if (!handlers) return;
  const eventType = event.type;
  const handlerName = `on${eventType}`;
  const handler = handlers[handlerName];
  if (handler && typeof handler === "function") {
    handler(event);
  }
}, "dispatchEvent");
var setEventHandlers = /* @__PURE__ */ __name((domElement, props) => {
  const handlers = {};
  for (const propKey in props) {
    if (!props.hasOwnProperty(propKey)) {
      continue;
    }
    if (propKey.startsWith("on") && typeof props[propKey] === "function") {
      const eventType = propKey.toLowerCase();
      handlers[eventType] = props[propKey];
    }
  }
  if (Object.keys(handlers).length > 0) {
    domElement[EVENT_HANDLERS_KEY] = handlers;
  }
}, "setEventHandlers");

// src/rectify-fiber/RectifyFiberTags.ts
var HostRoot = /* @__PURE__ */ Symbol.for("rectify.fiber.host-root");
var HostComponent = /* @__PURE__ */ Symbol.for("rectify.fiber.host-component");
var HostText = /* @__PURE__ */ Symbol.for("rectify.fiber.host-text");
var FunctionComponent = /* @__PURE__ */ Symbol.for("rectify.fiber.function-component");

// src/rectify-fiber/RectifyFiberFlags.ts
var NoFlags = 0;
var Placement = 1;
var Update = 2;

// src/rectify-fiber/RectifyFiber.ts
var createRectifyFiber = /* @__PURE__ */ __name((tag, props) => {
  var _a, _b;
  const fiber = {
    root: null,
    tag,
    props,
    key: isPlainObject(props) ? (_a = props.key) != null ? _a : null : null,
    memorizedProps: null,
    flags: NoFlags,
    type: null,
    stateNode: null,
    alternate: null,
    return: null,
    firstChild: null,
    sibling: null,
    ref: isPlainObject(props) ? (_b = props.ref) != null ? _b : null : null,
    index: 0,
    memorizedHook: null
  };
  return fiber;
}, "createRectifyFiber");
var createRectifyFiberBuilder = /* @__PURE__ */ __name((current, props) => {
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
    fiberBuilding.flags = NoFlags;
  }
  fiberBuilding.firstChild = current.firstChild;
  fiberBuilding.memorizedProps = current.memorizedProps;
  fiberBuilding.sibling = current.sibling;
  fiberBuilding.index = current.index;
  fiberBuilding.ref = current.ref;
  return fiberBuilding;
}, "createRectifyFiberBuilder");
var createFiberFromRectifyNode = /* @__PURE__ */ __name((node) => {
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
    let firstFiber = null;
    let prevFiber = null;
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
}, "createFiberFromRectifyNode");

// src/rectify-fiber/RectifyFiberRoot.ts
var createFiberRoot = /* @__PURE__ */ __name((container) => {
  const fiber = createRectifyFiber(HostRoot);
  const root = {
    current: fiber,
    container
  };
  fiber.stateNode = container;
  fiber.root = root;
  return root;
}, "createFiberRoot");

// src/rectify-dom-binding/events/RectifyEventPlugin.ts
var setDOMProperties = /* @__PURE__ */ __name((domElement, props) => {
  if (!isPlainObject(props)) return;
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "key" || key === "class" || !Object.prototype.hasOwnProperty.call(props, key)) {
      continue;
    }
    if (key.startsWith("on") && isFunction(value)) {
      setEventHandlers(domElement, props);
      continue;
    }
    if (key === "className") {
      domElement.setAttribute("class", String(value));
      continue;
    }
    if (typeof value === "boolean") {
      if (value) {
        domElement.setAttribute(key, "");
      } else {
        domElement.removeAttribute(key);
      }
      continue;
    }
    if (value != null) {
      domElement.setAttribute(key, String(value));
    }
  }
}, "setDOMProperties");

// src/rectify-hook/RectifyHookBuilder.ts
var createRectifyHookBuilder = /* @__PURE__ */ __name(() => {
  const instance = {
    currentlyRenderingFiber: null,
    fiberHookIndex: 0,
    scheduleUpdateOnFiber: /* @__PURE__ */ __name(() => {
      console.warn("Schedule hook unimplemented");
    }, "scheduleUpdateOnFiber")
  };
  const setCurrentlyRenderingFiber2 = /* @__PURE__ */ __name((fiber) => {
    instance.currentlyRenderingFiber = fiber;
  }, "setCurrentlyRenderingFiber");
  const getCurrentlyRenderingFiber2 = /* @__PURE__ */ __name(() => {
    return instance.currentlyRenderingFiber;
  }, "getCurrentlyRenderingFiber");
  const setFiberHookIndex2 = /* @__PURE__ */ __name((num) => {
    instance.fiberHookIndex = num;
  }, "setFiberHookIndex");
  const getFiberHookIndex2 = /* @__PURE__ */ __name(() => {
    return instance.fiberHookIndex;
  }, "getFiberHookIndex");
  const setScheduleUpdateOnFiber2 = /* @__PURE__ */ __name((updater) => {
    instance.scheduleUpdateOnFiber = updater;
  }, "setScheduleUpdateOnFiber");
  const scheduleUpdateOnFiber2 = /* @__PURE__ */ __name((fiber) => {
    instance.scheduleUpdateOnFiber(fiber);
  }, "scheduleUpdateOnFiber");
  return {
    setCurrentlyRenderingFiber: setCurrentlyRenderingFiber2,
    getCurrentlyRenderingFiber: getCurrentlyRenderingFiber2,
    setFiberHookIndex: setFiberHookIndex2,
    getFiberHookIndex: getFiberHookIndex2,
    setScheduleUpdateOnFiber: setScheduleUpdateOnFiber2,
    scheduleUpdateOnFiber: scheduleUpdateOnFiber2
  };
}, "createRectifyHookBuilder");

// src/rectify-hook/RectifyHook.ts
var {
  setCurrentlyRenderingFiber,
  getCurrentlyRenderingFiber,
  setFiberHookIndex,
  getFiberHookIndex,
  setScheduleUpdateOnFiber: setScheduleUpdateOnFiberAction,
  scheduleUpdateOnFiber
} = createRectifyHookBuilder();
var setScheduleUpdateOnFiber = setScheduleUpdateOnFiberAction;
var _RectifyHookRenderer = class _RectifyHookRenderer {
  constructor(fiber, Component, props) {
    this.fiber = fiber;
    this.Component = Component;
    this.props = props;
  }
  render() {
    setCurrentlyRenderingFiber(this.fiber);
    setFiberHookIndex(0);
    const children = this.Component(this.props);
    setCurrentlyRenderingFiber(null);
    setFiberHookIndex(0);
    return children;
  }
};
__name(_RectifyHookRenderer, "RectifyHookRenderer");
var RectifyHookRenderer = _RectifyHookRenderer;
var useState = /* @__PURE__ */ __name((initialValue) => {
  const currentFiber = getCurrentlyRenderingFiber();
  const hook = updateFiberHook(currentFiber);
  if (hook.memoizedState === void 0) {
    hook.memoizedState = isFunction(initialValue) ? initialValue() : initialValue;
  }
  if (hook.queue !== null) {
    const queue = hook.queue;
    let update = queue.pending;
    if (update !== null) {
      let newState = hook.memoizedState;
      const first = update;
      do {
        const action = update.action;
        newState = isFunction(action) ? action(newState) : action;
        update = update == null ? void 0 : update.next;
      } while (update !== first);
      hook.memoizedState = newState;
      queue.pending = null;
    }
  }
  const setState = /* @__PURE__ */ __name((action) => {
    const update = {
      action,
      next: null
    };
    if (hook.queue === null) {
      hook.queue = {
        pending: null
      };
    }
    const queue = hook.queue;
    if (queue.pending === null) {
      update.next = update;
    } else {
      update.next = queue.pending.next;
      queue.pending.next = update;
    }
    queue.pending = update;
    scheduleUpdateOnFiber(currentFiber);
  }, "setState");
  return [hook.memoizedState, setState];
}, "useState");
var updateFiberHook = /* @__PURE__ */ __name((fiber) => {
  let hook;
  const currentHook = getCurrentHook(fiber);
  if (currentHook === null) {
    hook = {
      memoizedState: void 0,
      queue: null,
      next: null
    };
  } else {
    hook = {
      memoizedState: currentHook.memoizedState,
      queue: currentHook.queue,
      next: null
    };
  }
  if (fiber.memorizedHook === null) {
    fiber.memorizedHook = hook;
  } else {
    let lastHook = fiber.memorizedHook;
    while (lastHook.next !== null) {
      lastHook = lastHook.next;
    }
    lastHook.next = hook;
  }
  let index = getFiberHookIndex();
  setFiberHookIndex(index++);
  return hook;
}, "updateFiberHook");
var getCurrentHook = /* @__PURE__ */ __name((fiber) => {
  const alternate = fiber.alternate;
  if (alternate === null) {
    return null;
  }
  let hook = alternate.memorizedHook;
  for (let i = 0; i < getFiberHookIndex(); i++) {
    if (hook === null) return null;
    hook = hook.next;
  }
  return hook;
}, "getCurrentHook");

// src/rectify-fiber/RectifyFiberReconciler.ts
var createContainer = /* @__PURE__ */ __name((container) => {
  const root = createFiberRoot(container);
  setScheduleUpdateOnFiber((fiber) => {
    const hostRoot = getHostRootFiber(fiber);
    if (!hostRoot) return;
    const fiberBuilder = createRectifyFiberBuilder(hostRoot, hostRoot.props);
    syncFiber(fiberBuilder);
    completeFiber(fiberBuilder);
    commitFiber(fiberBuilder);
    if (hostRoot.root) {
      hostRoot.root.current = fiberBuilder;
    }
  });
  return root;
}, "createContainer");
var updateContainer = /* @__PURE__ */ __name((children, root) => {
  const current = root.current;
  const fiberBuilder = createRectifyFiberBuilder(current, { children });
  syncFiber(fiberBuilder);
  completeFiber(fiberBuilder);
  commitFiber(fiberBuilder);
  root.current = fiberBuilder;
}, "updateContainer");
var syncFiber = /* @__PURE__ */ __name((fiber) => {
  syncFiberNode(fiber);
}, "syncFiber");
var syncFiberNode = /* @__PURE__ */ __name((fiber) => {
  const child = updateFiberChildren(fiber);
  let node = child;
  while (node) {
    syncFiberNode(node);
    node = node.sibling;
  }
}, "syncFiberNode");
var completeFiber = /* @__PURE__ */ __name((fiberBuilder) => {
  const current = fiberBuilder.alternate;
  switch (fiberBuilder.tag) {
    case HostComponent: {
      if (current) {
        fiberBuilder.stateNode = current.stateNode;
        break;
      }
      if (!isText(fiberBuilder.type)) {
        break;
      }
      const type = fiberBuilder.type;
      const instance = document.createElement(type);
      fiberBuilder.stateNode = instance;
      setDOMProperties(instance, fiberBuilder.props);
      break;
    }
    case HostText: {
      if (current) {
        fiberBuilder.stateNode = current.stateNode;
        break;
      }
      const instance = document.createTextNode(
        String(isPlainObject(fiberBuilder.props) ? "" : fiberBuilder.props)
      );
      fiberBuilder.stateNode = instance;
      break;
    }
  }
  let child = fiberBuilder.firstChild;
  while (child) {
    completeFiber(child);
    child = child.sibling;
  }
}, "completeFiber");
var commitFiber = /* @__PURE__ */ __name((fiber) => {
  let child = fiber.firstChild;
  while (child) {
    commitFiber(child);
    child = child.sibling;
  }
  const flags = fiber.flags;
  if (flags & Update) {
    commitFiberUpdate(fiber);
    fiber.flags &= ~Update;
  }
  if (flags & Placement) {
    commitFiberPlacement(fiber);
    fiber.flags &= ~Placement;
  }
}, "commitFiber");
var commitFiberUpdate = /* @__PURE__ */ __name((fiberBuilder) => {
}, "commitFiberUpdate");
var commitFiberPlacement = /* @__PURE__ */ __name((fiber) => {
  if (fiber.tag !== HostComponent && fiber.tag !== HostText) return;
  const hostParent = getHostParentFiber(fiber);
  if (!hostParent) return;
  const parent = hostParent.stateNode;
  if (parent && fiber.stateNode) {
    parent.appendChild(fiber.stateNode);
  }
}, "commitFiberPlacement");
var getHostParentFiber = /* @__PURE__ */ __name((fiber) => {
  let parent = fiber.return;
  while (parent) {
    if (parent.tag === HostComponent || parent.tag === HostRoot) {
      return parent;
    }
    parent = parent == null ? void 0 : parent.return;
  }
  return null;
}, "getHostParentFiber");
var getHostRootFiber = /* @__PURE__ */ __name((fiber) => {
  let node = fiber;
  while (node && node.tag !== HostRoot) node = node.return;
  return node;
}, "getHostRootFiber");
var updateFiberChildren = /* @__PURE__ */ __name((fiber) => {
  const canHaveChildren = [HostComponent, HostRoot, FunctionComponent];
  if (!canHaveChildren.includes(fiber.tag)) {
    return null;
  }
  reconcileChildren(fiber);
  return fiber.firstChild;
}, "updateFiberChildren");
var reconcileChildren = /* @__PURE__ */ __name((fiberBuilder) => {
  const nextChildren = resolveChildren(fiberBuilder);
  const firstChild = createFiberFromRectifyNode(nextChildren);
  if (!firstChild) return;
  fiberBuilder.firstChild = firstChild;
  attachFiber(firstChild, fiberBuilder);
  let sibling = firstChild.sibling;
  while (sibling) {
    attachFiber(sibling, fiberBuilder);
    sibling = sibling.sibling;
  }
}, "reconcileChildren");
var resolveChildren = /* @__PURE__ */ __name((fiberBuilder) => {
  const Component = isFunction(fiberBuilder.type) && fiberBuilder.type;
  if (Component) {
    const props = fiberBuilder.props;
    const renderWithHooks = new RectifyHookRenderer(
      fiberBuilder,
      Component,
      props
    );
    return renderWithHooks.render();
  }
  if (isPlainObject(fiberBuilder.props)) {
    return fiberBuilder.props.children;
  }
  return fiberBuilder.props;
}, "resolveChildren");
var attachFiber = /* @__PURE__ */ __name((fiberBuilder, parentFiberBuilder) => {
  fiberBuilder.return = parentFiberBuilder;
  if (fiberBuilder.alternate) {
    fiberBuilder.flags |= Update;
  } else {
    fiberBuilder.flags |= Placement;
  }
}, "attachFiber");

// src/rectify-dom/RectifyDomRoot.ts
var _RectifyDomRoot = class _RectifyDomRoot {
  constructor(fiberRoot) {
    this.fiberRoot = fiberRoot;
  }
  render(node) {
    const root = this.fiberRoot;
    updateContainer(node, root);
  }
};
__name(_RectifyDomRoot, "RectifyDomRoot");
var RectifyDomRoot = _RectifyDomRoot;
var createRoot = /* @__PURE__ */ __name((container) => {
  const root = createContainer(container);
  listenAllEventSupported(container);
  return new RectifyDomRoot(root);
}, "createRoot");

export { createRoot, jsx, useState };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map