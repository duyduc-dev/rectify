/**
 * The type representing the type of a Rectify element,
 * which can be a string (for HTML elements), a function component, or null (for fragments)
 */
export type RectifyElementType = string | RectifyFunctionComponent | null;

/**
 * A function component in Rectify, which takes props and returns a RectifyNode
 */
export type RectifyFunctionComponent<P = any> = ((props: P) => RectifyNode) &
  RectifyFunctionComponentConfigs<P>;

/**
 * The core structure representing a Rectify element
 */
export type RectifyElement = {
  /**
   * A unique symbol to identify Rectify elements
   */
  __type__: symbol;

  /**
   * The key used to identify this element in a list
   */
  key: RectifyKey;

  /**
   * The type of the element, which can be a string (for HTML elements),
   * a function component, or null (for fragments)
   */
  type: RectifyElementType;

  /**
   * The properties/attributes/text of the element
   */
  props: unknown;

  /**
   * The index of the element in its parent's children array, used for reconciliation
   */
  index: number;
};

/**
 * A fragment in Rectify, which is a special type of element
 * that allows grouping multiple children without adding extra nodes to the DOM
 */
export type RectifyNode =
  | RectifyText
  | RectifyElement
  | Iterable<RectifyNode>
  | boolean
  | null
  | undefined;

/**
 * The type representing a key for Rectify elements,
 */
export type RectifyKey = string | number | null | undefined;

/**
 * The type representing text nodes in Rectify,
 */
export type RectifyText = string | number;

/**
 * The type representing the props of a Rectify element,
 */
export type RectifyFunctionComponentConfigs<P = any> = {
  defaultProps?: Partial<P>;
};

/**
 * The type representing a React function component, which is a function that takes props and returns a RectifyNode
 */
export type FC<P> = RectifyFunctionComponent<P>;
