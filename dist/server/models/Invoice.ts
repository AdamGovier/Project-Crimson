import CrimsonEntity from "../crimson/CrimsonEntity";
import { Column, Entity } from 'typeorm';

@Entity()
export default class Invoice extends CrimsonEntity {
    @Column()
    invoicedOnDate!: Date;
    /*!--empty-line--!*/
    @Column()
    dueDate!: Date;
    /*!--empty-line--!*/
    @Column()
    totalAmount!: number;
    /*!--empty-line--!*/
    @Column()
    comments!: string;
    /*!--empty-line--!*/
    @Column()
    isPaid?: boolean;
}
