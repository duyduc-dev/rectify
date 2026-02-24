import { isIterable, isTextNode, toArray } from "@rectify/shared/utilities";
import { RectifyElement } from "./RectifyTypes";
import { RECTIFY_TEXT_TYPE } from "./RectifyElementConstants";
import { isValidRectifyElement, toTextNodeElement } from "./RectifyCoreService";

const withNormalizeChildren = (props: any): Iterable<RectifyElement> => {
  const children = props?.children;

  if (!children) return [];

  if (isTextNode(children)) {
    const textElement = {
      __type__: RECTIFY_TEXT_TYPE,
      key: null,
      type: null,
      props: children,
      index: 0,
    };
    return [textElement];
  }

  if (isIterable(children)) {
    const out: RectifyElement[] = [];
    let index = 0;
    for (const child of children) {
      if (isTextNode(child)) {
        const childElement = toTextNodeElement(child);
        childElement.index = index++;
        out.push(childElement);
      } else if (isValidRectifyElement(child)) {
        const childElement = child;
        childElement.index = index++;
        out.push(childElement);
      } else {
        out.push(child as RectifyElement)
      }
    }
    return out;
  }

  return toArray(children);
};

const withNormalizeProps = (props: any) => {
  return {
    ...props,
    children: withNormalizeChildren(props),
  };
};

export { withNormalizeProps };
