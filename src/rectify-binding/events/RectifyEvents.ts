const isEvent = (k: string) => k.startsWith("on");
const isProperty = (k: string) => k !== "children" && !isEvent(k);

function setEvent(dom: Element, name: string, next?: any, prev?: any) {
  const eventType = name.slice(2).toLowerCase();
  if (prev) dom.removeEventListener(eventType, prev);
  if (next) dom.addEventListener(eventType, next);
}

function convertStyleObjectToString(styleObj: object) {
  return Object.entries(styleObj)
    .map(
      ([key, value]) =>
        key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ":" + value,
    )
    .join("; ");
}

export function updateDomProps(dom: Node, prevProps: any, nextProps: any) {
  // Text node
  if (dom.nodeType === Node.TEXT_NODE) {
    const prev = prevProps?.nodeValue;
    const next = nextProps?.nodeValue;

    if (prev !== next) (dom as Text).nodeValue = next ?? "";
    return;
  }

  const el = dom as Element;

  // Remove old events
  for (const k in prevProps) {
    if (isEvent(k) && !(k in nextProps))
      setEvent(el, k, undefined, prevProps[k]);
  }

  // Remove old properties
  for (const k in prevProps) {
    if (isProperty(k) && !(k in nextProps)) {
      (el as any)[k] = "";
      el.removeAttribute(k);
    }
  }

  // Set new / changed properties
  for (const k in nextProps) {
    if (k === "children") continue;

    if (isEvent(k)) {
      if (prevProps[k] !== nextProps[k])
        setEvent(el, k, nextProps[k], prevProps[k]);
    } else if (k === "style") {
      el.setAttribute("style", convertStyleObjectToString(nextProps[k]));
    } else {
      const v = nextProps[k];
      // handle className -> class
      if (k === "className") el.setAttribute("class", v ?? "");
      else if (v === false || v === null || v === undefined)
        el.removeAttribute(k);
      else el.setAttribute(k, String(v));
    }
  }
}
