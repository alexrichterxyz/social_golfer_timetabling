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
                font-size: 18px;
                margin-top: 4px;
            }

            p {
                color: var(--md-sys-color-secondary);
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
        this.#roles = newRoles;
    }

    #resetError() {
        this.#errorMessageElement.innerText = '';
    }

    #reportError(message) {
        this.#errorMessageElement.innerText = message;
    }

    get valid() {
        return this.roles !== null;
    }

    get roles() {
        return this.#roles;
    }
}

customElements.define('roles-input', RolesInput);