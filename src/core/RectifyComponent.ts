import { toFragmentElement } from "./RectifyCoreService";
import { RectifyKey, RectifyNode } from "./RectifyTypes";

type Props = {
  key?: RectifyKey;
  children?: RectifyNode;
};

export const Fragment = (props: Props = {}) => {
  return toFragmentElement(props?.children, props);
};
