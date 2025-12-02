import { parseCSVLine } from "./csv.js";

class CSVPicker extends HTMLElement {
    #inputElement;
    #errorMessageElement;
    #pickerElement;
    #resetButtonElement;
    #zonePeople;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    float: left;
                }

                div {
                    height: 48px;
                }

                span {
                    display: block;
                }

                input {
                    display: none;
                    margin-top: 4px;
                }

                #reset-button {
                    all: unset;
                    background-color: #fff;
                    width: 32px;
                    height: 32px;
                    font-size: 20px;
                    cursor: pointer;
                    line-height: 32px;
                    text-align: center;
                    color: var(--md-sys-color-primary);
                    border: 1px solid var(--md-sys-color-primary);
                    box-sizing: border-box;
                    margin-top: 4px;
                }

                #picker-button {
                    display: inline-block;
                    float: left;
                    height: 32px;
                    width: calc(100% - 32px);
                    background-color: var(--md-sys-color-primary);
                    line-height: 32px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: center;
                    cursor: pointer;
                    color: #fff;
                    margin-top: 4px;
                }

                p {
                    color: var(--md-sys-color-secondary);
                }
            }
            </style>
            <div>
                <label>
                    <span>Select a CSV</span>
                    <div id="picker-button">None selected</div>
                    <input type="file" accept=".csv" />
                </label>
                <button id="reset-button">&#10005;</button>
            </div>
            <p></p>
        `;

        this.#zonePeople = {};
        this.#inputElement = this.shadowRoot.querySelector('input');
        this.#errorMessageElement = this.shadowRoot.querySelector('p');
        this.#resetButtonElement = this.shadowRoot.querySelector('#reset-button');
        this.#pickerElement = this.shadowRoot.querySelector('#picker-button');

        this.#inputElement.onchange = this.#onSelectedFile.bind(this);
        this.#resetButtonElement.onclick = this.#reset.bind(this);
    }

    #reset() {
        this.#zonePeople = {};
        this.#pickerElement.innerText = 'Select a CSV file';
        this.#resetError();
        this.onChanged(this.#zonePeople)
    }

    #resetError() {
        this.#errorMessageElement.innerText = '';
    }

    #reportError(message) {
        this.#errorMessageElement.innerText = message;
    }

    #parseCSV(e) {
        this.#zonePeople = {};
        // this method is not robust to escaped commas etc.
        const csv = e.target.result.trim();
        // may not work with escaped newlines
        const lines = csv.trim().split('\n');

        if(lines.length < 5) {
            this.#reportError('CSV file must contain column names and at least 4 rows');
            this.onChanged(this.#zonePeople);
            return;
        }

        const data = lines.map(parseCSVLine);
        const columns = data[0].map(c => c.toLowerCase());

        const nameColIdx = columns.indexOf('name');
        const zoneColIdx = columns.indexOf('zone');

        if(nameColIdx < 0) {
            this.#reportError('Required column `name` is missing.');
            this.onChanged(this.#zonePeople);
            return;
        }

        for(const [i, row] of data.slice(1).entries()) {
            if(nameColIdx >= row.length) {
                this.#reportError(`Invalid number of values in row ${i+1}`); 
                this.#zonePeople = {};
                this.onChanged(this.#zonePeople)
                return;
            }

            const zone = zoneColIdx < row.length ? row[zoneColIdx] : '';
            const name = row[nameColIdx];

            if(!this.#zonePeople.hasOwnProperty(zone)) {
                this.#zonePeople[zone] = [];
            } else if(this.#zonePeople[zone].includes(name)) {
                continue;
            } else {
                this.#zonePeople[zone].push(name);
            }
        }

        this.onChanged(this.#zonePeople)
    }

    // customizable callback
    onChanged(zonePeople) {}

    #onSelectedFile() {
        const file = this.#inputElement.files[0];

        if (!file) {
            reportError('Invalid CSV file.')
            return;
        }

        this.#pickerElement.innerText = file.name;

        const reader = new FileReader();
        reader.onload = this.#parseCSV.bind(this);
        reader.readAsText(file);
    }

    get valid() {
        return Object.keys(this.#zonePeople).length > 0;
    }

    get data() {
        return this.#zonePeople;
    }
}

customElements.define('csv-picker', CSVPicker);