import './dataframe';
import { DataFrame } from './dataframe';

class Optimizer {
    #numWeeks;
    #roles;
    #zones;
    #errors;

    constructor() {
        this.#numWeeks = 12;
        this.#roles = ['Leader', 'Scribe', 'Researcher'];
        this.#zones = {};
        this.#errors = {};
    }

    set numWeeks(numWeeks) {
        numWeeks = parseInt(numWeeks);

        if(typeof numWeeks !== 'number' || numWeeks < 2) {
            const error = new Error("Value must be an integer greater than 1.");
            this.#errors.numWeeks = error;
            throw error;
        }

        this.#errors.numWeeks = error;
        this.#numWeeks = numWeeks;
    }

    get numWeeks() {
        return this.#numWeeks;
    }

    set roles(roles) {
        if(typeof roles === 'string') {
            roles = roles.split(',');
            return;
        }

        this.#roles = roles.map(r => r.trim());
    }

    get roles() {
        return this.#roles;
    }

    set zones(zones) {
        if(!(zones instanceof DataFrame)) {
            throw new Error('Argument zones must be of type DataFrame.');
        }

        zones.columns = zones.columns.map(c => c.toLowerCase());

        if(!zones.columns.includes('person')) {
            const error = new Error();
            
        }
    }
}

export const optimizer = new Optimizer();