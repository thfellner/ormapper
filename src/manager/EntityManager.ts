export class EntityManager {
    /*static TS_TYPE_DICTIONARY: { [tsType: string] : string; } = {
        "int": "INTEGER",
        "string": "TEXT",
        "double": "REAL",
        "boolean": "BOOLEAN",
        "Date": "DATE",
        "DateTime": "DATETIME"
    }*/

    static TS_TYPE_DICTIONARY: Map<new() => Object, string> = new Map<new() => Object, string>([
        [String, "TEXT"],
        [Number, "INTEGER"],
        [Boolean, "BOOLEAN"],
        [Date, "DATE"]

    ])
    
    static getDBType(tsType: new() => Object) {
        if (!EntityManager.TS_TYPE_DICTIONARY.has(tsType))
            throw Error("TypeScript Type is not supported")

        return EntityManager.TS_TYPE_DICTIONARY.get(tsType);
    }

    static getTypescriptType(dbType: string) {
        for (let [key, value] of EntityManager.TS_TYPE_DICTIONARY) {
            if (value === dbType)
                return key;
        }
        throw Error("TypeScript Type is not supported")
    }
}