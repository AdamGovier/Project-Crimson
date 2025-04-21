import CrimsonEntity from "../crimson/CrimsonEntity";
import { Column, Entity } from 'typeorm';

@Entity()
export default class Customer extends CrimsonEntity {
    @Column()
    firstName!: string;
    /*!--empty-line--!*/
    @Column()
    lastName!: string;
    /*!--empty-line--!*/
    @Column()
    email!: string;
    /*!--empty-line--!*/
    @Column()
    phoneNumber!: string;
}
