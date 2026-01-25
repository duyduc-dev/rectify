const EVENT_HANDLERS_KEY = "__rectifyEventHandlers__";

const RectifyEventSupported = [
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
  "dblclick",
];

export const listenAllEventSupported = (domElement: Element) => {
  RectifyEventSupported.forEach((eventType) => {
    domElement.addEventListener(
      eventType,
      (event: Event) => {
        dispatchEvent(event, domElement);
      },
      false, // Bubble phase
    );
  });
};

const dispatchEvent = (event: Event, domElement: Element) => {
  const targetElement = event.target as Element;
  if (!targetElement) return;
  const handlers = (targetElement as any)[EVENT_HANDLERS_KEY];
  if (!handlers) return;

  const eventType = event.type; // 'click', 'input', etc.
  const handlerName = `on${eventType}`; // 'onclick', 'oninput'

  const handler = handlers[handlerName];

  if (handler && typeof handler === "function") {
    handler(event);
  }
};

export const setEventHandlers = (domElement: Element, props: any): void => {
  const handlers: any = {};

  for (const propKey in props) {
    if (!props.hasOwnProperty(propKey)) {
      continue;
    }

    // Check if it's an event handler (starts with 'on')
    if (propKey.startsWith("on") && typeof props[propKey] === "function") {
      const eventType = propKey.toLowerCase(); // 'onclick', 'oninput'
      handlers[eventType] = props[propKey];
    }
  }

  // Store handlers on the DOM element
  if (Object.keys(handlers).length > 0) {
    (domElement as any)[EVENT_HANDLERS_KEY] = handlers;
  }
};
