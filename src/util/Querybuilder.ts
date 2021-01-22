import { Entity } from "../metadata/Entity";
import { Field } from "../metadata/Field";
import { TypeConverter } from "./TypeConverter"

/**
 * Querybuilder for select statements
 */
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

interface ForeignKey {
    field: string,
    foreignTable: string,
    foreignColumn: string
}

/**
 * Query builder for Create Statements
 */
export class CreateTable {

    query: string;
    foreignKeys: ForeignKey[];

    constructor (table: string) {
        this.query = `CREATE TABLE IF NOT EXISTS ${table} (`;
        this.foreignKeys = [];
    }

    column(col: Field, pk: boolean = false, notNull: boolean = false, unique: boolean = false) {
        this.query += `${col.name} ${TypeConverter.getDBType(col.type)}${pk ? ' PRIMARY KEY' : ''}${notNull ? ' NOT NULL ' : ''}${unique ? ' UNIQUE' : ''}, `
    }

    
    primaryKey(col: Field) {
        this.column(col, true);
    }
    
    foreignKey(col: Field) {
        let foreignEntity= ((new col.type)['entity'] as Entity);
        foreignEntity.primaryKeys.forEach(foreignPrimary => {
            this.foreignKeys.push({
                field: foreignEntity.tableName + "_" + foreignPrimary.name + "_FK",
                foreignTable: foreignEntity.tableName,
                foreignColumn: foreignPrimary.name
            });
            this.column(new Field(foreignEntity.tableName + "_" + foreignPrimary.name + "_FK", foreignPrimary.type));
        });

        
    }

    end() {
        this.query = this.query.substring(0, this.query.length - 2);
        if (this.foreignKeys.length > 0) {
            
            this.foreignKeys.forEach(foreignKey => {
                this.query += ", FOREIGN KEY("
                this.query += foreignKey.field
                this.query += ")"
                this.query += " REFERENCES "
                this.query += foreignKey.foreignTable
                this.query += "("+foreignKey.foreignColumn+")"
            });
        }
        this.query += ')'
    }
}

/**
 * Query Builder for Insert statements
 */
export class Insert {

    query: string;
    columnNames: string[];
    values: string[];

    constructor (table: string) {
        this.columnNames = [];
        this.values = [];
        this.query = `INSERT OR REPLACE INTO ${table} `;
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

/**
 * Query builder for update statements
 */
export class Update {

    query: string;
    state: string;
    columnNames: string[];
    values: string[];

    constructor (table: string) {
        this.state = "update"
        this.columnNames = [];
        this.values = [];
        this.query = `UPDATE ${table} SET`;
    }

    set(columnName: string, value: string) {
        switch(this.state) {
            case "where":
                throw new Error("Invalid State. Set must be after where Clause");
            case "update":
                this.query += ` ${columnName} = ${value}`;
                break;
            default:
                throw new Error("Invalid State. Set must be after where Clause");
        }
        this.columnNames.push(columnName);
        this.values.push(value);
    }

    where(column: string, comparison: string, value: string, or: boolean = false){

        if (!Select.ALLOWED_COMPARISONS.includes(comparison.toLowerCase())) {
            throw new Error(`Invalid comparator.\n The allowed Comparisons are ${Select.ALLOWED_COMPARISONS.join(", ")}`)
        }

        if (this.state === "update") {
            this.query += " WHERE"
        }

        switch(this.state) {
            case "where":
                this.query += or ? ' OR' : ' AND';
            case "update":
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

export class Delete {

    query: string;
    state: string;

    constructor (table: string) {
        this.query = `DELETE FROM ${table} `;
        this.state = "delete"
    }

    where(column: string, comparison: string, value: string, or: boolean = false){

        if (!Select.ALLOWED_COMPARISONS.includes(comparison.toLowerCase())) {
            throw new Error(`Invalid comparator.\n The allowed Comparisons are ${Select.ALLOWED_COMPARISONS.join(", ")}`)
        }

        if (this.state === "delete") {
            this.query += " WHERE"
        }

        switch(this.state) {
            case "where":
                this.query += or ? ' OR' : ' AND';
            case "delete":
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