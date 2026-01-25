export type RectifyElementType<P = Record<string, any>> = string | RectifyFunctionComponent<P>;

export type RectifyElementKey = string | number | null;

export type RectifyElementRefObject<T = any> = {
  current: T | null;
};

export type RectifyElement<P = any> = {
  $$typeof: symbol;
  type: RectifyElementType | null;
  props: RectifyElementProps<P> | null;
  key: RectifyElementKey;
  ref: RectifyElementRefObject<any> | null;
};

export type RectifyFragment = void | boolean | null | undefined;

export type RectifyText = string | number;

export type RectifyNode =
  | RectifyElement<any>
  | RectifyText
  | RectifyFragment
  | RectifyNode[];

export type RectifyElementProps<P = Record<string, any>, K = any> =
  | null
  | undefined
  | string
  | number
  | (P & {
      ref?: RectifyElementRefObject<K>;
      key?: RectifyElementKey;
      children?: RectifyNode;
    });

export type RectifyFunctionComponent<P = Record<string, any>> = (
  props?: RectifyElementProps<P>,
) => RectifyNode;
