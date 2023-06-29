'use strict';

document.getElementById('tag-input').addEventListener('keyup', function(e) {
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Comma') {
    e.preventDefault();

    const inputValue = this.value.trim().toLowerCase();
    if (inputValue) {
      const tags = inputValue.split(/[ ,]+/);

      const existingTags =
          Array.from(document.getElementById('tags-container').children)
              .map(tagElem => tagElem.firstElementChild.textContent);

      for (let tag of tags) {
        if (tag && !existingTags.includes(tag)) {
          const newTag = document.createElement('span');
          newTag.className = 'tag';

          const tagText = document.createElement('span');
          tagText.textContent = tag;
          newTag.appendChild(tagText);

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'X';
          deleteButton.addEventListener('click', function() {
            newTag.remove();
          });

          newTag.appendChild(deleteButton);
          document.getElementById('tags-container').appendChild(newTag);

          // Add tag to autocomplete datalist
          const option = document.createElement('option');
          option.value = tag;
          document.getElementById('tags-list').appendChild(option);
        }
      }

      this.value = '';
    }
  }
});

document.getElementById('clear-all').addEventListener('click', function() {
  document.getElementById('tags-container').innerHTML = '';
  // Also clear autocomplete datalist
  document.getElementById('tags-list').innerHTML = '';
});
