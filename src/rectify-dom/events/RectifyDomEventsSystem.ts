const EVENTS_HANDLER_KEY = Symbol.for("rectify.events.handler");

const SupportedEvents = [
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "mouseover",
  "mouseout",
  "mousemove",
  "keydown",
  "keyup",
  "keypress",
  "change",
  "input",
  "submit",
];

const listenAllSupportedEvents = (container: Element) => {
  for (const eventName of SupportedEvents) {
    container.addEventListener(
      eventName,
      (event: Event) => {
        dispatchEvent(event, container);
      },
      false, // Bubble phase
    );
  }
};

const dispatchEvent = (event: Event, rootContainerElement: Element) => {
  const targetElement = event.target as Element;

  if (!targetElement) return;

  // Get the event handlers from the target element
  const handlers: Map<string, Function> | undefined = (targetElement as any)[
    EVENTS_HANDLER_KEY
  ];

  if (!handlers) return;

  const eventType = event.type; // 'click', 'input', etc.

  const handler = handlers.get(eventType);

  if (handler && typeof handler === "function") {
    handler(event);
  }
};

const setEventHandler = (
  element: Element,
  eventKey: string,
  handler: Function,
) => {
  const eventName = extractEventName(eventKey);
  if (!SupportedEvents.includes(eventName)) return;
  const handlersMap: Map<string, Function> =
    (element as any)[EVENTS_HANDLER_KEY] || new Map();
  handlersMap.set(eventName, handler);
  (element as any)[EVENTS_HANDLER_KEY] = handlersMap;
};

const extractEventName = (eventKey: string): string => {
  if (eventKey.startsWith("on")) {
    return eventKey.slice(2).toLowerCase();
  }
  return eventKey.toLowerCase();
};

export { listenAllSupportedEvents, setEventHandler };
