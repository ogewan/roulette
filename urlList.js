class UrlList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  set data(value) {
    this._data = value;
    this.render();
  }

  get data() {
    return this._data;
  }

  connectedCallback() {}

  render() {
    this.shadowRoot.innerHTML = `
            <style>
                ul {
                    list-style-type: none;
                }
                li {
                    margin-bottom: 10px;
                }
                .sub-list {
                    margin-left: 20px;
                }
            </style>
            <ul>
                ${
        this.data
            .map(
                item => `
                    <li>
                        <span>${
                    item.url.length > 50 ? item.url.substring(0, 50) + '...' :
                                           item.url}</span>
                        <span> (${
                    new Date(item.timestamp * 1000).toLocaleString()})</span>
                        <ul class="sub-list">
                            ${
                    Object.entries(item)
                        .filter(
                            ([key, value]) =>
                                key !== 'url' && key !== 'timestamp' && value)
                        .map(([key]) => `
                                <li>${key}</li>
                            `)
                        .join('')}
                        </ul>
                    </li>
                `)
            .join('')}
            </ul>
        `;
  }
}

customElements.define('url-list', UrlList);
