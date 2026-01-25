import { RectifyElementProps } from "@rectify/core/RectifyTypes";
import { isFunction, isPlainObject } from "@rectify/shared/utilities";
import { setEventHandlers } from "./RectifyEventHandler";

export const setDOMProperties = (
  domElement: Element,
  props: RectifyElementProps,
) => {
  if (!isPlainObject(props)) return;

  for (const [key, value] of Object.entries(props)) {
    // Skip internal / unsupported props
    if (
      key === "children" ||
      key === "key" ||
      key === "class" ||
      !Object.prototype.hasOwnProperty.call(props, key)
    ) {
      continue;
    }

    // Event handlers (onClick, onInput, ...)
    if (key.startsWith("on") && isFunction(value)) {
      setEventHandlers(domElement, props);
      continue;
    }

    // Normalize className
    if (key === "className") {
      domElement.setAttribute("class", String(value));
      continue;
    }

    // Boolean attributes (disabled, checked, ...)
    if (typeof value === "boolean") {
      if (value) {
        domElement.setAttribute(key, "");
      } else {
        domElement.removeAttribute(key);
      }
      continue;
    }

    // Normal attributes
    if (value != null) {
      domElement.setAttribute(key, String(value));
    }
  }
};
