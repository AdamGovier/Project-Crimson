import CrimsonEntity from "@crimson/base/CrimsonEntity";
import { Column } from "typeorm";

export default class Inventory extends CrimsonEntity {
  serialNumber!: string;

  name!: string;

  description!: string;
}
