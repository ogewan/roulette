'use strict';

// const e = require('express');

let urlStore = [];
let filteredUrlStore = [];
let filters = {};
let filterList = [];
let filterTimestring = '';
let filterTimestamp = 0;
let tagSet = new Set();

function addUrlsAndTags() {
  const urlInput = document.getElementById('url-input').value;
  const urls = urlInput.split(/,|\n/).map(str => str.trim());
  const tags = document.getElementById('tags').tags;

  for (let url of urls) {
    // filter strings to make sure they are valid urls
    if (!url.match(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)) continue;
    let urlObj = {url: url, weight: 1};
    for (let tag of tags) {
      urlObj[tag] = true;
    }
    urlStore.push(urlObj);
  }

  // Add tags to autocomplete datalist
  for (let tag of tags) {
    if (!tagSet.has(tag)) {
      tagSet.add(tag);
    }
  }

  // Clear input fields
  document.getElementById('url-input').value = '';
  document.getElementById('tags').clearAll();
  // update tag-input autocomplete
  document.querySelectorAll('tag-input')
      .forEach(elem => elem.autoComplete(tagSet));
}

/*function filterUrls() {
  const filterInput = document.getElementById('tag-filter').value;
  const filters = filterInput.split(/,|\n/).map(str => str.trim());

  urlStore = urlStore.filter(urlObj => {
    for (let filter of filters) {
      if (!urlObj[filter]) return false;
    }
    return true;
  });
}*/

function generateUrl() {
  // get the filters
  const liveFilter = document.getElementById('filters').tags;
  const liveTimestring = document.getElementById('filtertime').value;
  if (filterTimestring !== liveTimestring) {
    filterTimestring = liveTimestring;
    filterTimestamp = Date.parse(filterTimestring);
  }
  if (filterList !== liveFilter) {
    filterList = liveFilter;
    filters = filterList.reduce((obj, property) => {
      obj[property] = true;
      return obj;
    }, {});
    filteredUrlStore = filterObjects(urlStore, filters, filterTimestamp);
  }
  const urlObj = getRandomUrl(filteredUrlStore);
  // document.getElementById('selected-url').href = urlObj.url;
  if (urlObj)
    generatePreview(urlObj.url);
  else
    console.log('No url found');
}

function snoozeUrl() {
  const url = document.getElementById('selected-url').href;
  for (let urlObj of urlStore) {
    if (urlObj.url === url) urlObj.weight--;
  }
}

function blockUrl() {
  const url = document.getElementById('selected-url').href;
  urlStore = urlStore.filter(urlObj => urlObj.url !== url);
}

function getRandomUrl(source = urlStore) {
  let totalWeight = source.reduce((total, urlObj) => total + urlObj.weight, 0);
  let randomNum = Math.floor(Math.random() * totalWeight);
  let weightSum = 0;

  for (let urlObj of source) {
    weightSum += urlObj.weight;
    if (randomNum < weightSum) return urlObj;
  }

  // Default to first url if no url selected (for instance if total weight is
  // zero)
  // return urlStore[0];
}

function generatePreview(url) {
  $.post('/preview', {url: url})
      .done(function(data) {
        $('#preview-container')
            .html(`
          <a href="${
                data.url || url}" target="_blank" class="panel panel-default">
              <h3 class="panel-heading">${data.title || url}</h3>
              <div class="panel-body">
                <img class="preview" src="${data.image}" alt="Preview image">
                <p>${data.description || ''}</p>
              </div>
          </a>
      `);
      })
      .fail(function() {
        const thumb =
            'https://raw.githubusercontent.com/koehlersimon/fallback/master/Resources/Public/Images/placeholder.jpg'
        $('#preview-container').html(`
          <a href="${url}" target="_blank" class="panel panel-default">
              <h3 class="panel-heading">${url}</h3>
              <div class="panel-body">
                <img class="preview" src="${thumb}" alt="Preview image">
                <p>${''}</p>
              </div>
          </a>
        `);
      });
}

function filterObjects(objects, filters) {
  return objects.filter(obj => {
    for (let key in filters) {
      if (obj[key] !== filters[key]) {
        return false;
      }
    }
    return true;
  });
}

function clearTime() {
  filterTimestring = document.getElementById('filtertime').value = '';
  filterTimestamp = 0;
}
/*
let filters = {
  property1: true,
  property2: false,
  // ...
};

let objects = [
  {
    property1: true,
    property2: false,
    creationDate: new Date('2021-01-01')
  },
  {
    property1: false,
    property2: true,
    creationDate: new Date('2022-01-01')
  },
  // ...
];
*/

// let selectedObject = randomObjectWithFilters(objects, filters);


class TagInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.render();
    this.inputElement = this.shadowRoot.getElementById('tag-input');
    this.tagsContainer = this.shadowRoot.getElementById('tags-container');
    this.clearAllButton = this.shadowRoot.getElementById('clear-all');
    this.datalist = this.shadowRoot.getElementById('autocomplete');
    this.tags = [];
  }

  connectedCallback() {
    this.inputElement.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.clearAllButton.addEventListener('click', this.clearAll.bind(this));
  }

  autoComplete(entries) {
    this.datalist.innerHTML = '';
    for (let entry of entries) {
      let option = document.createElement('option');
      option.value = entry;
      this.datalist.appendChild(option);
    }
  }

  handleKeyUp(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      let tag = this.inputElement.value.trim();
      this.inputElement.value = '';
      if (tag && !this.tags.includes(tag.toLowerCase())) {
        this.tags.push(tag.toLowerCase());
        let tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        let closeBtn = document.createElement('span');
        closeBtn.textContent = ' X';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', () => {
          this.tagsContainer.removeChild(tagElement);
          this.tags = this.tags.filter(t => t !== tag.toLowerCase());
        });
        tagElement.appendChild(closeBtn);
        this.tagsContainer.appendChild(tagElement);
      }
    }
  }

  clearAll() {
    this.tagsContainer.innerHTML = '';
    this.tags = [];
  }

  render() {
    this.shadowRoot.innerHTML = `
            <style>
              .tag {
                  display: inline-block;
                  margin: 5px;
                  padding: 5px;
                  border: 1px solid #000;
                  border-radius: 5px;
              }

              .tag button {
                  margin-left: 10px;
              }
            </style>
            <div style="display: inline-flex;">
              <input type="text" id="tag-input" list="autocomplete" placeholder="Input tags here...">
              <button id="clear-all">Clear All</button>
            </div>
            <datalist id="autocomplete"></datalist>
            <div id="tags-container"></div>
        `;
  }
}
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
customElements.define('tag-input', TagInput);
