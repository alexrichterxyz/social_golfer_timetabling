import createModule from '../../build/optimizer.js'

const modulePromise = createModule();

async function optimize(config) {
    const Module = await modulePromise;

    Module.reportProgress = (x) => {
        self.postMessage({
            operation: 'progress',
            payload: x
        });
    }

    const serialized = Module.optimize(
        config.groups, config.people.length, config.roles.length, config.tables, config.weeks
    );

    const result = {person: [], group: [], role: [], table: [], week: []};

    let i = 0;
    for(let week = 0; week < config.weeks; week++) {
        for(let group = 0; group < config.groups; group++) {
            const memberCount = serialized.get(i++)
            
            for(let memberIdx = 0; memberIdx < memberCount; memberIdx++) {
                const person = config.people[serialized.get(i++)];
                const roleRaw = serialized.get(i++);
                const role = roleRaw < config.roles.length ? config.roles[roleRaw] : '';
                const table = serialized.get(i++)+1

                result.person.push(person);
                result.week.push(week+1);
                result.group.push(group+1);
                result.role.push(role);
                result.table.push(table);
            }

        }
    }
    
    self.postMessage({
        operation: 'result',
        payload: result
    });
}

self.onmessage = async (e) => {
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