import { isFunction, isPlainObject } from "@rectify/shared/utilities";
import { setEventHandler } from "../events/RectifyDomEventsSystem";

export const setAttributes = (element: Element, props: any) => {
  if (!isPlainObject(props)) return;

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (key === "key") continue;

    if (key.startsWith("on") && isFunction(value)) {
      setEventHandler(element, key, value);
      continue;
    }

    if (key === "className") {
      element.setAttribute("class", String(value));
      continue;
    }

    if (key === "style" && isPlainObject(value)) {
      const styleString = Object.entries(value)
        .map(([styleKey, styleValue]) => {
          const kebabCaseKey = styleKey.replace(
            /[A-Z]/g,
            (match) => `-${match.toLowerCase()}`,
          );
          return `${kebabCaseKey}: ${styleValue}`;
        })
        .join("; ");
      element.setAttribute("style", styleString);
      continue;
    }

    element.setAttribute(key, String(value));
  }
};
