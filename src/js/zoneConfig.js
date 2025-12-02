class ZoneConfigRow extends HTMLElement {
    #zone;
    #numTables;
    #numGroups;
    #numPeople;
    #zoneElement;
    #numPeopleElement;
    #avgPerGroupElement;
    #numTablesInput;
    #numGroupsInput
    #numTablesErrorElement;
    #numGroupsErrorElement;

    constructor(zone, numPeople) {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: table-row;
                    width: 100%;
                    border-top: 1px solid #ccc;
                }

                .cell {
                    display: table-cell;
                    padding: 4px;
                }

                input {
                    all: unset;
                    width: 100%;
                    background-color: #fff;
                    text-align: right;
                    box-sizing: border-box;
                    height: 32px;
                }

                p {
                    color: var(--md-sys-color-secondary);
                }
            </style>   
            <div class="cell" id="zone"></div>
            <div class="cell" id="num-people"></div>
            <div class="cell" id="avg-per-group"></div>
            <div class="cell">
                <input id="num-groups" type="number" />
                <p id="num-groups-error"></p>
            </div>
            <div class="cell">
                <input id="num-tables" type="number" />
                <p id="num-tables-error"></p>
            </div>
        `;

        this.#zoneElement = this.shadowRoot.querySelector('#zone');
        this.#numPeopleElement = this.shadowRoot.querySelector('#num-people');
        this.#avgPerGroupElement = this.shadowRoot.querySelector('#avg-per-group');
        this.#numTablesInput = this.shadowRoot.querySelector('#num-tables');
        this.#numGroupsInput = this.shadowRoot.querySelector('#num-groups');
        this.#numTablesErrorElement = this.shadowRoot.querySelector('#num-tables-error');
        this.#numGroupsErrorElement = this.shadowRoot.querySelector('#num-groups-error');

        this.#numGroupsInput.oninput = this.#onNumGroupsChange.bind(this);
        this.#numTablesInput.oninput = this.#onNumTablesChange.bind(this);

        const defaultPeoplePerGroup = 6;
        this.#numPeople = numPeople;
        this.#numGroups = Math.max(2, Math.ceil(this.#numPeople / defaultPeoplePerGroup));
        this.#numTables = this.#numGroups
        this.#zone = zone;

        this.#zoneElement.innerText = this.#zone;
        this.#numPeopleElement.innerText = this.#numPeople;
        this.#avgPerGroupElement.innerText = (this.#numPeople / this.#numGroups).toFixed(2);
        this.#numTablesInput.value = this.#numTables;
        this.#numGroupsInput.value = this.#numGroups;
    }
    
    #reportNumTablesError(message) {
        this.#numTablesErrorElement.innerText = message;
    }

    #resetNumTablesError(message) {
        this.#numTablesErrorElement.innerText = '';
    }

    #reportNumGroupsError(message) {
        this.#numGroupsErrorElement.innerText = message;
    }

    #resetNumGroupsError(message) {
        this.#numGroupsErrorElement.innerText = '';
    }

    #onNumGroupsChange() {
        this.#numGroups = null;
        const newNumGroups = parseInt(this.#numGroupsInput.value);

        if(isNaN(newNumGroups) || newNumGroups < 1) {
            this.#reportNumGroupsError('Invalid number of groups');
            return;
        }

        if(newNumGroups > this.#numTables) {
            this.#reportNumGroupsError('Each group must have a table');
            return;
        }

        this.#numGroups = newNumGroups;
        this.#avgPerGroupElement.innerText = (this.#numPeople / this.#numGroups).toFixed(2);
        this.#resetNumGroupsError();
    }

    #onNumTablesChange() {
        this.#numTables = null;
        const newNumTables = parseInt(this.#numTablesInput.value);

        if(isNaN(newNumTables) || newNumTables < 1) {
            this.#reportNumTablesError('Invalid number of tables');
            return;
        }

        if(newNumTables >= this.#numGroups) {
            return;
        }

        this.#numTables = newNumTables;
        this.#resetNumTablesError();

        this.#numGroups = this.#numTables;
        this.#numGroupsInput.value = this.#numGroups;
        this.#resetNumGroupsError();
        this.#avgPerGroupElement.innerText = (this.#numPeople / this.#numGroups).toFixed(2);
    }

    get valid() {
        return this.#numGroups && this.#numTables;
    }

    get data() {
        return {
            zone: this.#zone,
            numGroups: this.#numGroups,
            numTables: this.#numTables
        };
    }
}

customElements.define('zone-config-row', ZoneConfigRow);


class ZoneConfigTable extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    width: 100%;
                    display: table;
                    border-collapse: collapse;
                }

                .thead {
                    display: table-row;
                    font-weight: bold;
                    line-height: 32px;
                }

                .cell {
                    display: table-cell;
                    vertical-align: center;
                }

            </style>
            <div class="thead">
                <div class="cell">Zone</div>
                <div class="cell"># of people</div>
                <div class="cell">Avg. people per group</div>
                <div class="cell"># of groups</div>
                <div class="cell"># of tables</div>
            </div>
        `;
    }

    #getRows() {
        return this.shadowRoot.querySelectorAll('zone-config-row')
    }

    reset() {
        this.#getRows().forEach(el => el.remove());
    }

    init(zonePeople) {
        this.reset();

        for(const zone of Object.keys(zonePeople).sort()) {
            const numPeople = zonePeople[zone].length;
            const zoneRow = new ZoneConfigRow(zone, numPeople);
            this.shadowRoot.appendChild(zoneRow);
        }        
    }

    get valid() {
        const rows = this.#getRows();
        return rows.length > 0 && [...rows].every(row => row.valid);
    }

    get data() {
        const rowData = [...this.#getRows()].map(row => row.data);

        return rowData.reduce((obj, {zone, ...fields }) => {
            obj[zone] = fields;
            return obj;
        }, {})
    }
    
}

customElements.define('zone-config-table', ZoneConfigTable);