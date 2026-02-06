import { isIterable, isTextNode, toArray } from "@rectify/shared/utilities";
import { RectifyElement } from "./RectifyTypes";
import { RECTIFY_TEXT_TYPE } from "./RectifyElementConstants";
import { toTextNodeElement } from "./RectifyCoreService";

const withNormalizeChildren = (props: any): Iterable<RectifyElement> => {
  const children = props?.children;

  if (!children) return [];

  if (isTextNode(children)) {
    const textElement = {
      __type__: RECTIFY_TEXT_TYPE,
      key: null,
      type: null,
      props: children,
    };
    return [textElement];
  }

  if (isIterable(children)) {
    const out: RectifyElement[] = [];
    for (const child of children) {
      if (isTextNode(child)) {
        out.push(toTextNodeElement(child));
      } else {
        out.push(child as RectifyElement);
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
