import type CrimsonEntity from "../base/CrimsonEntity";
import Invoice from "../../../input/src/models/Invoice"

export interface DataComponentProps<TEntityModel extends CrimsonEntity> {
  // new (): was a work around to force the Vue props to be able to understand the specified generic type.
  entityModel: {new() : TEntityModel};
}

export interface DataComponentPropsWithListCache<TEntityModel extends CrimsonEntity> extends DataComponentProps<TEntityModel> {
  localCache: TEntityModel[];
}