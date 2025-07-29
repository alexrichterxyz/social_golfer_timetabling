const config = {
    zones: {},
    weeks: 12,
    roles: ['Leader', 'Scribe', 'Researcher']
};

const rolesElement = document.getElementById('roles');
const progressElement = document.getElementById('progress');
const submitElement = document.getElementById('submit');
const csvElement = document.getElementById('csv');
const weeksElement = document.getElementById('weeks');
const zoneTableElement = document.getElementById('zone-table');
const errorElement = document.getElementById('error');
let isReportingError = false;
let progress = 0.0;

document.addEventListener('DOMContentLoaded', () => {
    csvElement.value = '';
    weeksElement.value = config.weeks;
    rolesElement.value = config.roles.join(', ');
    submitElement.disabled = true;
    setProgress(progress);
});

function reportError(message) {
    isReportingError = true;
    submitElement.disabled = true;
    errorElement.innerText = message;
}

function resetError() {
    if(isReportingError) {
        errorElement.innerText = '';
        submitElement.disabled = false;
    }

    isReportingError = false;
}

function disableInputs() {
    document.querySelectorAll('input').forEach(input => input.disabled = true);
}

function enableInputs() {
    document.querySelectorAll('input').forEach(input => input.disabled = false);
}

rolesElement.oninput = (event) => {
    config.roles = event.target.value.split(',').map(e => e.trim());
}

weeksElement.oninput = (event) => {
    const weeks = parseInt(event.target.value);
    
    if(!Number.isInteger(weeks) || weeks < 2) {
        reportError('Number of weeks must be an integer greater than 2.');
        return;
    }

    config.weeks = weeks;
    resetError();
}


csvElement.onchange = (event) => {
    config.zones = {};
    submitElement.disabled = true;
    const file = event.target.files[0];
    if (!file) {
        reportError('Invalid CSV file.')
        return;
    }

    const reader = new FileReader();

    function getZoneInput(id, value, oninput) {
        const inputElement = document.createElement('input');
        inputElement.id = id;
        inputElement.type = 'number';
        inputElement.step = '1';
        inputElement.value = value;
        inputElement.min = '2';
        inputElement.oninput = oninput;
        return inputElement
    }

    function insertZoneTableRow(index, zone) {
        const body = zoneTableElement.getElementsByTagName('tbody')[0];
        const row = body.insertRow();
        const cells = []
        
        for(let i = 0; i < 5; i++) {
            cells.push(row.insertCell());
        }

        const people = config.zones[zone].people.length;
        cells[0].innerText = zone === '' ? 'Unnamed' : zone;
        cells[1].innerText = people;
        
        const defaultPeoplePerGroup = 6;
        const groups = Math.max(2, Math.ceil(people / defaultPeoplePerGroup));
        const tables = groups;
        const peoplePerGroup = people / groups;
        config.zones[zone].tables = tables;
        config.zones[zone].groups = groups;

        cells[2].innerText = peoplePerGroup.toFixed(2);

        const groupInput = getZoneInput(
            `groups-${index}`,
            groups,
            (event) => {
                const groups = parseInt(event.target.value);
                const people = config.zones[zone].people.length;

                if(!Number.isInteger(groups)) {
                    reportError('Invalid number of groups.');
                    return;
                }

                if(config.zones[zone].tables < groups) {
                    cells[4].firstChild.value = groups;
                }

                const peoplePerGroup = people / groups;
                cells[2].innerText = peoplePerGroup.toFixed(2);
                config.zones[zone].groups = groups;
                resetError();
            }
        );

        const tableInput = getZoneInput(
            `tables-${index}`,
            tables,
            (event) => {
                const tables = parseInt(event.target.value);

                if(!Number.isInteger(tables)) {
                    reportError('Invalid number of tables.');
                    return;
                }

                if(tables < config.zones[zone].groups) {
                    reportError(`Each group must have a table in '${zone}'.`);
                    return;
                }

                config.zones[zone].tables = tables;
                resetError();
            }
        );

        cells[3].appendChild(groupInput);
        cells[4].appendChild(tableInput);
    }
    
    reader.onload = (e) => {
        resetError();
        
        const csv = e.target.result;
        // this may not work if there are escaped commas or linebreaks
        const rows = csv.split('\n');

        if(rows.length < 2) {
            reportError('CSV requires at least 2 rows.');
        }

        const colNames = rows[0].toLowerCase().split(',').map(e => e.trim());
        const personIndex = colNames.indexOf('name');

        if(personIndex === -1) {
            reportError('Required column `name` is missing.');
            return;
        }

        const zoneIndex = colNames.indexOf('zone');
        const minValueIndex = Math.max(personIndex, zoneIndex);
        const zonePeople = {};

        for(const row of rows.slice(1)) {
            // sometimes the last row is empty
            if(row == '') {
                continue;
            }

            const values = row.split(',').map(e => e.trim());

            if(values.length <= minValueIndex) {
                reportError('Invalid CSV file.');
                return;
            }

            const zone = zoneIndex !== -1 ? values[zoneIndex] : '';
            const person = values[personIndex];

            if(!zonePeople.hasOwnProperty(zone)) {
                zonePeople[zone] = new Set();
            }

            if(zonePeople[zone].has(person)) {
                reportError(`Each name in the CSV must be unique in each zone (duplicate '${zone}'-'${person}').`);
                return
            }

            zonePeople[zone].add(person);

            if(!config.zones.hasOwnProperty(zone)) {
                config.zones[zone] = {
                    groups: 2,
                    tables: 2,
                    people: [person]
                };
            } else {
                config.zones[zone].people.push(person);
            }
        }

        const body = zoneTableElement.getElementsByTagName('tbody')[0];
        body.innerHTML = '';
        
        Object.keys(config.zones).forEach((zone, index) => {
            insertZoneTableRow(index, zone);
        });
        zoneTableElement.style.display = 'table';
    }
    
    reader.readAsText(file);

    if(!isReportingError) {
        submitElement.disabled = false;
    }
}

function downloadCSV(data) {
    const columns = Object.keys(data);
    const rowCount = data[columns[0]].length;
    const rows = [columns];
    for(let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const row = [];

        for(const col of columns) {
            row.push(data[col][rowIdx]);
        }

        rows.push(row);
    }

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

function setProgress(x) {
    progress = x;
    progressElement.style.width = `${progress * 100}%`;
}

submitElement.onclick = () => {
    // users may change config as the optimization is ongoing
    setProgress(0.0);
    const submissionConfig = structuredClone(config);
    const numZones = Object.keys(submissionConfig.zones).length

    const workers = {};
    const workerProgress = {};
    const result = {
        zone: [],
        week: [],
        person: [],
        table: [],
        group: [],
        role: []
    };

    for(const [zone, zoneInfo] of Object.entries(submissionConfig.zones)) {
        const worker = new Worker(new URL('./wasm-worker.js', import.meta.url), {
            type: 'module'
        });

        worker.postMessage({
            operation: 'optimize',
            payload: {
                people: zoneInfo.people,
                tables: zoneInfo.tables,
                groups: zoneInfo.groups,
                weeks: submissionConfig.weeks,
                roles: submissionConfig.roles
            }
        });

        worker.onmessage = (e) => {
            const operation = e.data.operation;
            const payload = e.data.payload;

            switch(operation) {
                case 'result': {
                    const n = payload.person.length
                    result.zone.push(...Array(n).fill(zone));
                    result.person.push(...payload.person);
                    result.table.push(...payload.table);
                    result.week.push(...payload.week);
                    result.group.push(...payload.group);
                    result.role.push(...payload.role);
                    worker.terminate();
                    delete workers[zone];

                    if(Object.keys(workers).length === 0) {
                        downloadCSV(result);
                        setProgress(0.0);
                    }

                    break;
                }
                case 'progress': {
                    workerProgress[zone] = payload;
                    setProgress(Object.values(workerProgress).reduce(
                        (acc, val) => acc + val,
                        0
                    ) / numZones)
                    break;
                }
                case 'log': {
                    console.log(payload)
                    break;
                }
                default: {
                    break;
                }
            }
        }

        workers[zone] = worker;
    }

}
