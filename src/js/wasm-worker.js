import createModule from '../../public/optimizer.js'

const modulePromise = createModule();

async function optimize(config) {
    const Module = await modulePromise;
    const serialized = Module.optimize(
        config.groups, config.people.length, config.roles.length, config.tables, config.weeks
    );

    const result = {person: [], group: [], role: [], table: [], week: []};

    for(let week = 0; week < config.weeks; week++) {
        for(let group = 0; group < config.groups; group++) {
            const offset = week * config.groups + group;
            const person = config.people[serialized.get(offset)];
            const roleRaw = serialized.get(offset + 1);
            const role = roleRaw < config.roles.length ? config.roles[roleRaw] : '';
            const table = serialized.get(offset + 2)+1

            result.person.push(person);
            result.week.push(week+1);
            result.group.push(group+1);
            result.role.push(role);
            result.table.push(table);

        }
    }
    
    self.postMessage({
        operation: 'result',
        payload: result
    });
}

self.onmessage = async (e) => {
    self.postMessage({
        operation: 'log',
        payload: 'This is a test'
    });
    switch(e.data.operation) {
        case 'optimize': {
            optimize(e.data.payload);
            break;
        }
        default: {
            break;
        }
    }
};