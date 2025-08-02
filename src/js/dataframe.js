export class DataFrame {
    #data;
    #columns;

    constructor() {
        this.#data = {};
        this.#columns = [];
    }

    get columns() {
        return this.#columns;
    }

    set columns(cols) {
        if(this.#columns.length !== cols.length) {
            throw new Error('Number of columns must match');
        }

        const oldNewCols = {};

        for(let i = 0; i < this.#columns.length; i++) {
            oldNewCols[this.#columns[i]] = cols[i];
        }

        this.renameColumns(oldNewCols);
    }

    get length() {
        return this.#columns.length > 0 ? this.#data[this.#columns[0]].length : 0;
    }

    parseCSV(csv, options={}) {
        const delimiter = options.delimiter || ','
        const lines = csv.trim().split(/\r?\n/).filter(Boolean);

        if(lines.length < 1) {
            throw new Error("CSV must have column names.");
        }

        this.#columns = this.#parseCSVLine(lines[0], delimiter);
        const colSet = new Set(this.#columns);

        if(colSet.size !== this.#columns.length) {
            throw new Error('Column names must be unique.');
        }

        for(const col of this.#columns) {
            this.#data[col] = [];
        }

        const rows = lines.slice(1).map(line => this.#parseCSVLine(line, delimiter));

        for(const [r, row] of rows.entries()) {

            if(row.length !== this.#columns.length) {
                throw new Error(`Missing value in row ${r+2}.`);
            }

            for(const [c, col] of this.#columns.entries()) {
                this.#data[col].push(row[c]);
            }
        }
    }

    #parseCSVLine(line, delimiter) {
        const pattern = new RegExp(
            `(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^${delimiter}]+)|)(?=${delimiter}|$)`,
            'g'
        );

        const result = [];

        let match;
        while ((match = pattern.exec(line)) !== null) {
            const value = match[1]
                ? match[1].replace(/""/g, '"') // quoted field
                : match[2] || '';
            result.push(value.trim());
        }

        return result;
    }

    getRow(i) {
        const row = {};
        
        for(const col of this.#columns) {
            row[col] = this.#data[col][i];
        }

        return row;
    }

    getValuesFor(col) {
        return this.#data[col];
    }

    renameColumns(oldNewCols) {
        for(const [oldCol, newCol] of Object.entries(oldNewCols)) {
            const colIdx = this.#columns.indexOf(oldCol);

            if(colIdx === -1) {
                continue;
            }

            this.#columns[colIdx] = newCol;
            this.#data[newCol] = this.#data[oldCol];
            delete this.#data[oldCol];
        }
    } 
}