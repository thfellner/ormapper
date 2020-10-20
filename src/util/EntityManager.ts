class EntityManager {
    static TS_TYPE_DICTIONARY: { [tsType: string] : string; } = {
        "int": "INTEGER",
        "string": "TEXT",
        "double": "REAL",
        "boolean": "BOOLEAN",
        "Date": "DATE",
        "DateTime": "DATETIME"
    }

    static DB_TYPE_DICTIONARY: { [tsType: string] : string; } = {
        "INTEGER": "int",
        "TEXT": "string",
        "REAL": "double",
        "BOOLEAN": "boolean",
        "DATE": "Date",
        "DATETIME": "DateTime"
    }
    
    getDBType(tsType: string) {
        EntityManager.TS_TYPE_DICTIONARY[tsType];
    }

    getTypescriptType(dbType: string) {
        EntityManager.DB_TYPE_DICTIONARY[dbType];
    }
}