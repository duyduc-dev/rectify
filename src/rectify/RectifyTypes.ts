type RectifyText = string | number;

type JSXElementFunctional<P> = (props: P) => RectifyNode;

type RectifyElement<
  P = any,
  T extends string | JSXElementFunctional<any> =
    | string
    | JSXElementFunctional<any>,
> = {
  type: T;
  props: P;
  key: Key | null;
};

type RectifyNode =
  | RectifyElement
  | RectifyText
  | boolean
  | Iterable<RectifyNode>
  | null
  | undefined;

type RectifyFragment = Iterable<RectifyNode>;

type RectifyElementType = string | JSXElementFunctional<any>;

type Key = string | number | bigint;
