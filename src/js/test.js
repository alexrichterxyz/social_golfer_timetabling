class FancyButton extends HTMLElement {
  button;

constructor() {
    super();  
    this.button = document.createElement('button');
    this.button.innerText = 'Test';
  }

  connectedCallback() {
    this.appendChild(this.button);
    this.button.onclick = this.#onclick.bind(this);
  }

  #onclick() {
    alert(this.getAttribute('bla'))
  }
}


customElements.define('fancy-button', FancyButton);