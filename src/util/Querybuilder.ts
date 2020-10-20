class Select {

    // SQLite comparisons https://www.tutorialspoint.com/sqlite/sqlite_operators.htm
    static ALLOWED_COMPARISONS = ["==", "=", "!=", "<>", ">", "<", ">=", "<=", "!<", "!>", "like"]

    // new Select("table").where().where()
    query: string;
    state: string;

    constructor (table: string, fields: string[] = ["*"]) {
        this.query = `SELECT ${fields.join(", ")} FROM ${table}`;
        this.state = "select";
    }

    where(column: string, comparison: string, value: string){

        if (!Select.ALLOWED_COMPARISONS.includes(comparison.toLowerCase())) {
            throw new Error(`Invalid comparator.\n The allowed Comparisons are ${Select.ALLOWED_COMPARISONS.join(", ")}`)
        }

        switch(this.state) {
            case "select":
            case "where":
                this.query += ` WHERE ${column} ${comparison} ${value}`
            default:
                throw new Error("Invalid State. Try reordering the where clause")
        }

        return this;
    }

    whereLessThan(column: string, value: string) {
        this.where(column, "<", value)
    }

    whereLessThanOrEqual(column: string, value: string) {
        this.where(column, "<=", value)
    }

    whereMoreThan(column: string, value: string) {
        this.where(column, ">", value)
    }

    whereMoreThanOrEqual(column: string, value: string) {
        this.where(column, ">=", value)
    }

    whereEqual(column: string, value: string) {
        this.where(column, "==", value)
    }

    whereUnequal(column: string, value: string) {
        this.where(column, "!=", value)
    }

    whereLike(column: string, value: string) {
        this.where(column, "like", value)
    }

}