type RectifyElementType<P = Record<string, any>> = string | RectifyFunctionComponent<P>;
type RectifyElementKey = string | number | null;
type RectifyElementRefObject<T = any> = {
    current: T | null;
};
type RectifyElement<P = any> = {
    $$typeof: symbol;
    type: RectifyElementType | null;
    props: RectifyElementProps<P> | null;
    key: RectifyElementKey;
    ref: RectifyElementRefObject<any> | null;
};
type RectifyFragment = void | boolean | null | undefined;
type RectifyText = string | number;
type RectifyNode = RectifyElement<any> | RectifyText | RectifyFragment | RectifyNode[];
type RectifyElementProps<P = Record<string, any>, K = any> = null | undefined | string | number | (P & {
    ref?: RectifyElementRefObject<K>;
    key?: RectifyElementKey;
    children?: RectifyNode;
});
type RectifyFunctionComponent<P = Record<string, any>> = (props?: RectifyElementProps<P>) => RectifyNode;

declare const jsx: (type: any, props?: any) => RectifyElement;

type RectifyFiberTags = symbol;

type RectifyFiberFlags = number;

type Updater<T> = T | ((prev: T) => T);
type Dispatcher<T> = (updater: Updater<T>) => void;
type RectifyHook<T = any> = {
    memoizedState: T;
    queue: UpdateQueue<T> | null;
    next: RectifyHook<T> | null;
};
type UpdateQueue<T> = {
    pending: Update<T> | null;
};
type Update<T> = {
    action: Updater<T>;
    next: Update<T> | null;
};

type Fiber = {
    root: FiberRoot | null;
    tag: RectifyFiberTags;
    type: RectifyElementType | null;
    flags: RectifyFiberFlags;
    stateNode: Element | Text | null;
    alternate: Fiber | null;
    ref: RectifyElementRefObject | null;
    key: RectifyElementKey;
    props: RectifyElementProps;
    memorizedProps: RectifyElementProps;
    return: Fiber | null;
    firstChild: Fiber | null;
    sibling: Fiber | null;
    index: number | null;
    memorizedHook: RectifyHook<any> | null;
};
type FiberRoot = {
    current: Fiber;
    container: Element;
};

declare class RectifyDomRoot {
    private fiberRoot;
    constructor(fiberRoot: FiberRoot);
    render(node: RectifyNode): void;
}
declare const createRoot: (container: Element) => RectifyDomRoot;

declare const useState: <T>(initialValue: T | (() => T)) => [T, Dispatcher<T>];

export { type RectifyElement, type RectifyNode, createRoot, jsx, useState };
