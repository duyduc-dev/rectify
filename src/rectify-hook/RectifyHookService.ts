import {
  EffectHook,
  HookType,
  StateHook,
} from "@rectify/rectify-hook/RectifyHookTypes";
import { Hook } from "./RectifyHookTypes";

export const isEffectHook = <S>(h: Hook<S>): h is EffectHook =>
  h.type === HookType.EFFECT;

export const isStateHook = <S>(h: Hook<S>): h is StateHook<S> =>
  h.type === HookType.STATE;
