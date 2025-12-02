import './progressBar.js'
import './weekInput.js'
import './rolesInput.js'
import './zoneConfig.js'
import './csvPicker.js'
import {toCSVLine} from './csv.js'

const csvPickerElem = document.querySelector('csv-picker');
const weekInputElem = document.querySelector('week-input');
const rolesInputElem = document.querySelector('roles-input');
const zoneConfigTableElem = document.querySelector('zone-config-table');
const progressBarElem = document.querySelector('progress-bar');
const computeButtonElem = document.getElementById('compute');
const instructionsElem = document.getElementById('instructions');


csvPickerElem.onChanged = (zoneConfig) => {

    if(csvPickerElem.valid) {
        zoneConfigTableElem.style.display = 'table';
        instructionsElem.style.display = 'none';
        zoneConfigTableElem.init(zoneConfig);
        return;
    }

    zoneConfigTableElem.style.display = 'none';
    instructionsElem.style.display = 'block';
    
}

function compute() {
    
    if(!weekInputElem.valid || !rolesInputElem.valid ||
        !csvPickerElem.valid || !zoneConfigTableElem.valid) {
        alert("Invalid inputs");
    }

    // all inputs are valid
    const zoneConfig = zoneConfigTableElem.data; // {Zone1: {numWeeks: X, numTables: X}, ...}
    const zonePeople = csvPickerElem.data // {Zone1: [Name1, Name2], ...}
    const numZones = Object.keys(zonePeople).length;
    const numWeeks = weekInputElem.numWeeks;
    const roles = rolesInputElem.roles;

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

    progressBarElem.progress = 0.0;

    for(const zone in zoneConfig) {
        const worker = new Worker(new URL('./wasmWorker.js', import.meta.url), {
            type: 'module'
        });

        worker.postMessage({
            operation: 'optimize',
            payload: {
                people: zonePeople[zone],
                numTables: zoneConfig[zone].numTables,
                numGroups: zoneConfig[zone].numGroups,
                numWeeks: numWeeks,
                roles: roles
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

                    if(Object.keys(workers).length > 0) {
                        break
                    }

                    // done

                    downloadResultCSV(result);
                    progressBarElem.progress = 0.0;
                    break;
                }
                case 'progress': {
                    workerProgress[zone] = payload;
                    
                    progressBarElem.progress =  Object.values(workerProgress).reduce(
                        (acc, val) => acc + val
                    ) / numZones;

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
};

function downloadResultCSV(result) {
    const columns = Object.keys(result);
    const rowCount = result[columns[0]].length;
    const rows = [columns];

    // this can be done nice using transposes
    for(let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        const row = [];

        for(const col of columns) {
            row.push(result[col][rowIdx]);
        }

        rows.push(row);
    }

    const csv = rows.map(toCSVLine).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

computeButtonElem.addEventListener('click', compute);