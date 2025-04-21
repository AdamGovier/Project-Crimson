import CrimsonEntity from "@crimson/base/CrimsonEntity";
import { Column, Entity } from "typeorm";

export default class Invoice extends CrimsonEntity {
  invoicedOnDate!: Date;

  dueDate!: Date;

  totalAmount!: number;

  comments!: string;

  isPaid?: boolean;
}
