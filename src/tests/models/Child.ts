
import { PrimaryKey, Column, Entity, ManyToOne } from "../../util/Decorator";
import { Parent } from "./Parent";

@Entity
export class Child {

    @PrimaryKey()
    public id: string

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

    @ManyToOne()
    parent: Parent;
}