import CrimsonEntity from '@crimson/base/CrimsonEntity';
import { Column, Entity } from 'typeorm';

@Entity()
export default class Customer extends CrimsonEntity {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column()
  email!: string;

  @Column()
  phoneNumber!: string;
}