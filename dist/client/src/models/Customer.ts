import CrimsonEntity from "@crimson/base/CrimsonEntity";
import { Column, Entity } from "typeorm";

export default class Customer extends CrimsonEntity {
  firstName!: string;

  lastName!: string;

  email!: string;

  phoneNumber!: string;
}
