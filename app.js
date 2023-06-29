'use strict';

let urlStore = [];

function addUrlsAndTags() {
  const urlInput = document.getElementById('url-input').value;
  const tagInput = document.getElementById('tag-input').value;
  const urls = urlInput.split(/,|\n/).map(str => str.trim());
  const tags = tagInput.split(/,|\n/).map(str => str.trim());

  for (let url of urls) {
    // filter strings to make sure they are valid urls
    if (!url.match(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)) continue;
    let urlObj = {url: url, weight: 1};
    for (let tag of tags) {
      urlObj[tag] = true;
    }
    urlStore.push(urlObj);
  }

  // Clear input fields
  document.getElementById('url-input').value = '';
  document.getElementById('tag-input').value = '';
}

function filterUrls() {
  const filterInput = document.getElementById('tag-filter').value;
  const filters = filterInput.split(/,|\n/).map(str => str.trim());

  urlStore = urlStore.filter(urlObj => {
    for (let filter of filters) {
      if (!urlObj[filter]) return false;
    }
    return true;
  });
}

function generateUrl() {
  const urlObj = getRandomUrl();
  // document.getElementById('selected-url').href = urlObj.url;
  generatePreview(urlObj.url);
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

function getRandomUrl() {
  let totalWeight =
      urlStore.reduce((total, urlObj) => total + urlObj.weight, 0);
  let randomNum = Math.floor(Math.random() * totalWeight);
  let weightSum = 0;

  for (let urlObj of urlStore) {
    weightSum += urlObj.weight;
    if (randomNum < weightSum) return urlObj;
  }

  // Default to first url if no url selected (for instance if total weight is
  // zero)
  return urlStore[0];
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
