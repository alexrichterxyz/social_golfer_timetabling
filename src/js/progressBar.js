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
                }

                div {
                    height: 100%;
                    width: 0%;
                    background-color: var(--md-sys-color-primary);
                    opacity: 25%;
                    transition: width 0.1s ease;
                }
            }
            </style>
            <div></div>
        `;

        this.#barElement = this.shadowRoot.querySelector('div');
    }

    set progress(x) {
        if(x < 0.0 || x >= 1.0) {
            return;
        }

        this.#barElement.style.width = `${100*x}%`;
    }
}

customElements.define('progress-bar', ProgressBar);