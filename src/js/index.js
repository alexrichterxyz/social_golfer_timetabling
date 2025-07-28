const config = {
    zones: {},
    weeks: 12,
    roles: ['']
};

const rolesElement = document.getElementById('roles');
const progressElement = document.getElementById('progress');
const submitElement = document.getElementById('submit');
const csvElement = document.getElementById('csv');
const weeksElement = document.getElementById('weeks');
const zoneDataElement = document.getElementById('zone-data');
const errorElement = document.getElementById('error');
let isReportingError = false;
let progress = 0.0;

document.addEventListener('DOMContentLoaded', () => {
    csvElement.value = '';
    weeksElement.value = config.weeks;
    rolesElement.value = config.roles.join(', ');
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
    const file = event.target.files[0];
    if (!file) {
        reportError('Invalid CSV file.')
        return;
    }

    const reader = new FileReader();

    function getZoneInputAndLabel(id, label, zone, oninput) {
        const labelElement = document.createElement('label');
        labelElement.setAttribute('for', id);
        labelElement.textContent = label;

        const inputElement = document.createElement('input');
        inputElement.id = id;
        inputElement.type = 'number';
        inputElement.step = '1';
        inputElement.value = '2';
        inputElement.min = '2';
        inputElement.oninput = oninput;

        return {input: inputElement, label: labelElement};
    }

    function getZoneDataListItem(index, zone) {
        const li = document.createElement('li');
        const groupElements = getZoneInputAndLabel(
            `groups-${2*index}`,
            'Number of groups',
            zone,
            (event) => {
                const groups = parseInt(event.target.value);

                if(!Number.isInteger(groups)) {
                    reportError('Invalid number of groups');
                    return;
                }   

                config.zones[zone].groups = groups;
                resetError();
            }
        );
        
        const p = document.createElement('p');
        p.innerText = `${zone} (${config.zones[zone].people.length} people)`
        li.appendChild(p);
        li.appendChild(groupElements.label);
        li.appendChild(groupElements.input);

        const tableElements = getZoneInputAndLabel(
            `tables-${2*index+1}`,
            'Number of tables',
            zone,
            (event) => {
                const tables = parseInt(event.target.value);

                if(!Number.isInteger(tables)) {
                    reportError('Invalid number of tables');
                    return;
                }   
                
                config.zones[zone].tables = tables;
                resetError();
            }
        );
        li.appendChild(tableElements.label);
        li.appendChild(tableElements.input);

        return li;        
    }
    
    reader.onload = (e) => {
        const csv = e.target.result;
        // this may not work if there are escaped commas or linebreaks
        const rows = csv.split('\n');

        if(rows.length < 2) {
            reportError('CSV requires at least 2 rows.');
        }

        const colNames = rows[0].split(',').map(e => e.trim());
        const personIndex = colNames.indexOf('person');

        if(personIndex === -1) {
            reportError('Required column `person` is missing.');
        }

        const zoneIndex = colNames.indexOf('zone');
        const minValueIndex = Math.max(personIndex, zoneIndex);

        for(const row of rows.slice(1)) {
            // sometimes the last row is empty
            if(row == '') {
                continue;
            }

            const values = row.split(',').map(e => e.trim());

            if(values.length <= minValueIndex) {
                reportError('Invalid CSV file.');
            }

            const zone = zoneIndex !== -1 ? values[zoneIndex] : '';
            const person = values[personIndex];

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

        Object.keys(config.zones).forEach((zone, index) => {
            zoneDataElement.appendChild(getZoneDataListItem(index, zone));
        });
    }
    
    zoneDataElement.innerHTML = '';
    reader.readAsText(file);
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
