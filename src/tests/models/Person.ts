import { PrimaryKey, Column, Entity } from "../../util/Decorator";

@Entity
export class Person {

    @PrimaryKey()
    public id: string

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;
}