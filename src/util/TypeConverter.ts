/**
 * Class used for converting types
 */
export class TypeConverter {

    // a map which contains all type conversion types. This map will also be updated when new models are introduced
    static TS_TYPE_DICTIONARY: Map<new() => Object, string> = new Map<new() => Object, string>([
        [String, "TEXT"],
        [Number, "INTEGER"],
        [Boolean, "BOOLEAN"],
        [Date, "DATE"]

    ])
    
    // convert from typescript type to dbType
    static getDBType(tsType: new() => Object) {
        if (!TypeConverter.TS_TYPE_DICTIONARY.has(tsType))
            throw Error("TypeScript Type is not supported")

        return TypeConverter.TS_TYPE_DICTIONARY.get(tsType);
    }

    // convert from dbType to typescript type
    static getTypescriptType(dbType: string) {
        for (let [key, value] of TypeConverter.TS_TYPE_DICTIONARY) {
            if (value === dbType)
                return key;
        }
        throw Error("TypeScript Type is not supported")
    }
}