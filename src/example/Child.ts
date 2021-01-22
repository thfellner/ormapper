import { timeStamp } from "console";
import { PrimaryKey, Column, Entity, ManyToOne } from "../util/Decorator";
import { Person } from "./Person";

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
    parent: Person;
}