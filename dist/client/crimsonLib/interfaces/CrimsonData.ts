import CrimsonEntity from "../base/CrimsonEntity";

export interface CrimsonDataList<T extends CrimsonEntity> {
  items: T[]
}

export interface CrimsonFocussedItem<T extends CrimsonEntity> {
  item: T
}