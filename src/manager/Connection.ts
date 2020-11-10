import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

import { Repository } from "./Repository";
import { Entity } from '../metadata/Entity';
import { CreateTable } from '../util/Querybuilder';
import { table } from 'console';


export class Connection {

    repositories: Map<new() => Object, Repository<any>> = new Map();
    connection: Database;

    constructor(connection: any) {
        this.connection = connection;
    }


    getRepository <T> (table: new() => Object){
        if (this.repositories.has(table)) {
            return this.repositories.get(table);
        } else {
            let newRepo: Repository<T> = new Repository<T>(table, this);
            this.repositories.set(table, newRepo);
            return newRepo;
        }
    }

    async executeQuery (query: string) {
        await this.connection.exec(query);
    }

    
    
    async getAll <T = any[]>(query: string) {
        return await this.connection.all<T>(query)
    }

}

export async function createConnection(connectionObj: {filename: string, models?: (new() => Object)[]}) {
    const conn = new Connection(await open({
        filename: connectionObj.filename,
        driver: sqlite3.Database
    }));

    if (connectionObj.models !== undefined) {
        connectionObj.models.forEach(async model => {
            const modelEntity: Entity = Object.getOwnPropertyDescriptor(new model(), 'entity').value as Entity
            const tableQuery: CreateTable = new CreateTable(modelEntity.tableName)
            modelEntity.primaryKeys.forEach(field => {
                tableQuery.primaryKey(field)
            });

            modelEntity.fields.forEach(field => {
                tableQuery.column(field)
            });

            tableQuery.end();

            conn.executeQuery(tableQuery.query)
        });
    }

    return conn;
    
}
interface Row {
    col: string
}