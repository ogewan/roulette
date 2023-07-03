class AccordionTab extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render();
    this.titleElement = this.shadowRoot.querySelector('.accordion');
    this.contentElement = this.shadowRoot.querySelector('.panel');
  }

  connectedCallback() {
    this.titleElement.addEventListener('click', this.toggleContent.bind(this));
  }

  toggleContent() {
    this.titleElement.classList.toggle('active');
    this.contentElement.classList.toggle('visible');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .accordion {
            background-color: #eee;
            color: #444;
            cursor: pointer;
            padding: 18px;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            font-size: 15px;
            transition: 0.4s;
        }

        .active, .accordion:hover {
            background-color: #ccc; 
        }

        .panel {
            padding: 18px;
            display: none;
            background-color: white;
            overflow: hidden;
        }
        .visible.panel {
            display: block;
        }
      </style>
      <div class="accordion"><slot name="title">Default Title</slot></div>
      <div class="panel"><slot name="content">Default Content</slot></div>
    `;
  }
}

customElements.define('accordion-tab', AccordionTab);
