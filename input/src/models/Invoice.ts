import CrimsonEntity from '@crimson/base/CrimsonEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Invoice extends CrimsonEntity {
  @Column()
  invoicedOnDate!: Date;

  @Column()
  dueDate!: Date;

  @Column()
  totalAmount!: number;

  @Column()
  comments!: string;

  @Column()
  isPaid?: boolean
}