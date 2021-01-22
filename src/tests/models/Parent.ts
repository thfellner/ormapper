import { PrimaryKey, Column, Entity, OneToMany } from "../../util/Decorator";
import { Child } from "./Child"

@Entity
export class Parent {

    @PrimaryKey()
    public id: string

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

    @OneToMany()
    children: Array<Child>;
}