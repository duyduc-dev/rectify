export type RectifyText = string | number;

export type JSXElementFunctional<P> = (props: P) => RectifyNode;

export type RectifyElement<
  P = any,
  T extends string | JSXElementFunctional<any> =
    | string
    | JSXElementFunctional<any>,
> = {
  $$typeof: symbol;
  type: T;
  props: P;
  key: Key | null;
};

export type RectifyNode =
  | RectifyElement
  | RectifyText
  | boolean
  | Iterable<RectifyNode>
  | null
  | undefined;

export type RectifyFragment = Iterable<RectifyNode>;

export type RectifyElementType = string | JSXElementFunctional<any>;

export type Key = string | number | bigint;
