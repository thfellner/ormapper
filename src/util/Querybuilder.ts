import { Field } from "../metadata/Field";
import { EntityManager } from "../manager/EntityManager"

export class Select {

    // SQLite comparisons https://www.tutorialspoint.com/sqlite/sqlite_operators.htm
    static ALLOWED_COMPARISONS = ["==", "=", "!=", "<>", ">", "<", ">=", "<=", "!<", "!>", "like"]

    query: string;
    state: string;

    constructor (table: string, fields: string[] = ["*"]) {
        this.query = `SELECT ${fields.join(", ")} FROM ${table}`;
        this.state = "select";
    }

    where(column: string, comparison: string, value: string, or: boolean = false){

        if (!Select.ALLOWED_COMPARISONS.includes(comparison.toLowerCase())) {
            throw new Error(`Invalid comparator.\n The allowed Comparisons are ${Select.ALLOWED_COMPARISONS.join(", ")}`)
        }

        if (this.state === "select") {
            this.query += " WHERE"
        }

        switch(this.state) {
            case "where":
                this.query += or ? ' OR' : ' AND';
            case "select":
                this.query += ` ${column} ${comparison} ${value}`;
                break;
            default:
                throw new Error("Invalid State. Try reordering the where clause");
        }
        
        this.state = "where";

        return this;
    }

    whereLessThan(column: string, value: string) {
        this.where(column, "<", value);
    }

    whereLessThanOrEqual(column: string, value: string) {
        this.where(column, "<=", value);
    }

    whereMoreThan(column: string, value: string) {
        this.where(column, ">", value);
    }

    whereMoreThanOrEqual(column: string, value: string) {
        this.where(column, ">=", value);
    }

    whereEqual(column: string, value: string) {
        this.where(column, "==", value);
    }

    whereUnequal(column: string, value: string) {
        this.where(column, "!=", value);
    }

    whereLike(column: string, value: string) {
        this.where(column, "like", value);
    }
}


export class CreateTable {

    query: string;

    constructor (table: string) {
        this.query = `CREATE TABLE IF NOT EXISTS ${table} (`;
    }

    column(col: Field, pk: boolean = false, notNull: boolean = false, unique: boolean = false) {
        this.query += `${col.name} ${EntityManager.getDBType(col.type)}${pk ? ' PRIMARY KEY' : ''}${notNull ? ' NOT NULL ' : ''}${unique ? ' UNIQUE' : ''}, `
    }

    
    primaryKey(col: Field) {
        this.column(col, true);
    }

    end() {
        this.query = this.query.substring(0, this.query.length - 2);
        this.query += ')'
    }
}

export class Insert {

    query: string;
    columnNames: string[];
    values: string[];

    constructor (table: string) {
        this.columnNames = [];
        this.values = [];
        this.query = `INSERT INTO ${table} `;
    }

    set(columnName: string, value: string) {
        this.columnNames.push(columnName);
        this.values.push(value);
    }

    end() {
        this.query += '('
        this.columnNames.forEach(name => {
            this.query += `${name}, `
        });
        this.query = this.query.substring(0, this.query.length - 2);
        this.query += ')'

        this.query += ' VALUES'
        this.query += '('
        this.values.forEach(value => {
            this.query += `'${value}', `
        });
        this.query = this.query.substring(0, this.query.length - 2);
        this.query += ')'
    }
}