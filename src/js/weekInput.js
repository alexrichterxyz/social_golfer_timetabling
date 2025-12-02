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
                font-size: 18px;
                margin-top: 4px;
            }

            p {
                color: var(--md-sys-color-secondary);
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
        this.#numWeeks = null;
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

    get valid() {
        return this.#numWeeks !== null;
    }

    get numWeeks() {
        return this.#numWeeks;
    }

}

customElements.define('week-input', WeekInput);