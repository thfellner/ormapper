/**
 * Basic wrapper class for Fields
 */
export class Field {
    name: string;
    type: any;

    constructor(name: string, type: any) {
        this.name = name;
        this.type = type;
    }
}