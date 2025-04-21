import CrimsonEntity from "../crimson/CrimsonEntity";
import { Column } from "typeorm";

export default class Inventory extends CrimsonEntity {
    @Column()
    serialNumber!: string;
    /*!--empty-line--!*/
    @Column()
    name!: string;
    /*!--empty-line--!*/
    @Column()
    description!: string;
}
