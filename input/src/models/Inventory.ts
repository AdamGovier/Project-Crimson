import CrimsonEntity from "@crimson/base/CrimsonEntity";
import { Column } from "typeorm";

export default class Inventory extends CrimsonEntity {
  @Column()
  serialNumber!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;
}