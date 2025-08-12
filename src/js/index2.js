

class ProgressBar extends HTMLElement {
    #barElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: orange;
                    z-index: 0;
                }

                div {
                    height: 100%;
                    width: 0%;
                    background-color: blue;
                }
            }
            </style>
            <div></div>
        `;

        this.#barElement = this.shadowRoot.querySelector('div');
    }

    setProgress(x) {
        this.#barElement.style.width = `${100*x}%`;
    }
}

customElements.define('progress-bar', ProgressBar);




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
                    background-color: blue;
                }

                div {
                    height: 48px;
                    background-color: red;
                }

                span {
                    display: block;
                }

                input {
                    display: none;
                }

                #reset-button {
                    all: unset;
                    background-color: yellow;
                    width: 32px;
                    height: 32px;
                    line-height: 32px;
                    text-align: center;
                }

                #picker-button {
                    display: inline-block;
                    float: left;
                    height: 32px;
                    width: calc(100% - 32px);
                    background-color: red;
                    line-height: 32px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: center;
                }

                p {
                    margin: 0;
                    padding: 0;
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

        this.zonePeople = {};
        this.#inputElement = this.shadowRoot.querySelector('input');
        this.#errorMessageElement = this.shadowRoot.querySelector('p');
        this.#resetButtonElement = this.shadowRoot.querySelector('#reset-button');
        this.#pickerElement = this.shadowRoot.querySelector('#picker-button');
        
        this.#inputElement.onchange = this.#onSelectedFile.bind(this);
        this.#resetButtonElement.onclick = this.#reset.bind(this);
    }

    #reset() {
        //this.#inputElement.value = '';
        this.#pickerElement.innerText = 'Select a CSV file';
        this.#resetError();
    }

    #resetError() {
        this.#errorMessageElement.innerText = '';
    }

    #reportError(message) {
        this.#errorMessageElement.innerText = message;
    }

    #parseCSV(e) {
        // this method is not robust to escaped commas etc.
        const csv = e.target.result.trim();
        const delimiter = ',';
        const lines = csv.trim().split('\n');

        if(lines.length < 5) {
            this.#reportError('CSV file must contain column names and 4 rows');
        }

        const data = lines.map(l => l.split(',').map(v => v.trim()));
        const columns = data[0].map(c => c.toLowerCase());


        const nameColIdx = columns.indexOf('name');
        const zoneColIdx = columns.indexOf('zone');

        if(nameColIdx < 0) {
            this.#reportError('Required column `name` is missing.');
        }

        this.#zonePeople = {};

        for(const [i, row] of data.slice(1).entries()) {
            if(nameColIdx >= row.length) {
                this.#reportError(`Invalid number of values in row ${i+1}`); 
                this.#zonePeople = {};
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
    }

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
}

customElements.define('csv-picker', CSVPicker);

class WeekInput extends HTMLElement {
    #numWeeks;
    #weekInputElement;
    #errorMessageElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
            :host {
                display: inline-block;
                float: left;
            }
            input {
                all: unset;
                display: block;
                height: 32px;
                background-color: #fff;
                width: 100%;
            }
            </style>
            <label>
            Number of weeks
            <input type="number">
            </label>
            <p></p>
        `
        this.#numWeeks = 12;
        this.#weekInputElement = this.shadowRoot.querySelector('input');
        this.#weekInputElement.oninput = this.#onChangeWeek.bind(this);
        this.#errorMessageElement = this.shadowRoot.querySelector('p');
        this.#weekInputElement.value = this.#numWeeks;
    }

    #onChangeWeek() {
        const newNumWeeks = parseInt(this.#weekInputElement.value);

        if(isNaN(newNumWeeks) || newNumWeeks < 2) {
            this.#reportError('Weeks must be an integer greater than 2.');
            return;
        }

        this.#numWeeks = newNumWeeks;
        this.#resetError();
    }

    #resetError() {
        this.#errorMessageElement.innerText = '';
    }

    #reportError(message) {
        this.#errorMessageElement.innerText = message;
    }

}

customElements.define('week-input', WeekInput);

class RolesInput extends HTMLElement {
    #rolesInputElement;
    #errorMessageElement
    #roles;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: inline-block;
                float: left;
            }

            input {
                all: unset;
                display: block;
                background-color: #fff;
                height: 32px;
                width: 100%;
            }
        </style>
        <label>
        Enter roles separated by comma
        <input type="text"/>
        <label>
        <p></p>
        `;

        this.#rolesInputElement = this.shadowRoot.querySelector('input');
        this.#rolesInputElement.oninput = this.#onRolesChange.bind(this);
        this.#errorMessageElement = this.shadowRoot.querySelector('p');
        this.#roles = ['Leader', 'Scribe', 'Researcher'];
        this.#rolesInputElement.value = this.#roles.join(', ');

    }

    #onRolesChange() {
        const newRoles = this.#rolesInputElement.value.split(',').map(r => r.trim());

        if(new Set(newRoles).size !== newRoles.length) {
            this.#reportError('Roles must be unique.');
            return;
        }
        
        this.#resetError();
        this.#roles = newRoles;
    }

    #resetError() {
        this.#errorMessageElement.innerText = '';
    }

    #reportError(message) {
        this.#errorMessageElement.innerText = message;
    }

}

customElements.define('roles-input', RolesInput);

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
    #valid;

    constructor(zone, numPeople) {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: table-row;
                    width: 100%;
                    background-color: blue;
                    border-top: 1px solid #ccc;
                }

                .cell {
                    display: table-cell;
                    background-color: yellow;
                    padding: 4px;
                }

                input {
                    all: unset;
                    width: 100%;
                    background-color: #fff;
                    text-align: right;
                    box-sizing: border-box;
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
        this.#numTablesInput = this.shadowRoot.querySelector('#num-groups');
        this.#numGroupsInput = this.shadowRoot.querySelector('#num-tables');
        this.#numTablesErrorElement = this.shadowRoot.querySelector('#num-groups-error');
        this.#numGroupsErrorElement = this.shadowRoot.querySelector('#num-tables-error');

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
        const newNumGroups = parseInt(this.#numGroupsInput.value);

    }

    #onNumTablesChange() {
        
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
                    background-color: pink;
                    display: table;
                    border-collapse: collapse;
                }

                .thead {
                    display: table-row;
                    font-weight: bold;
                }

                .cell {
                    display: table-cell;
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

        const zoneRow = new ZoneConfigRow("Dome some", 100);
        this.shadowRoot.appendChild(zoneRow);
    }

 


}

customElements.define('zone-config-table', ZoneConfigTable);
