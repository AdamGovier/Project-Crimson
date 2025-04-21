import CrimsonComponent from "../base/CrimsonComponent";

/**
 * Allows CrimsonComponents to specify which controller to use, the logic is then computed by the compiler.
 */
export function useController<T extends CrimsonComponent>() : T {
  // @ts-ignore
  return;
}