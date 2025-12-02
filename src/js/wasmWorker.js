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
        config.numGroups,
        config.people.length,
        config.roles.length,
        config.numTables,
        config.numWeeks
    );

    const result = {person: [], group: [], role: [], table: [], week: []};

    let i = 0;
    for(let week = 1; week <= config.numWeeks; week++) {
        for(let group = 1; group <= config.numGroups; group++) {
            const memberCount = serialized.get(i++)
            
            for(let memberIdx = 0; memberIdx < memberCount; memberIdx++) {
                const person = config.people[serialized.get(i++)];
                const roleRaw = serialized.get(i++);
                const role = roleRaw < config.roles.length ? config.roles[roleRaw] : '';
                const table = serialized.get(i++)+1

                result.person.push(person);
                result.week.push(week);
                result.group.push(group);
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
    // potentially wrap methods in try catch
    // and send message back on error

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