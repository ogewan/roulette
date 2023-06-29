const express = require('express');
const bodyParser = require('body-parser');
const ogs = require('open-graph-scraper');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(
    '/',
    express.static(path.join(
        __dirname, '.')));  // serve static files from current directory

app.post('/preview', (req, res) => {
  ogs({url: req.body.url, downloadLimit: 100000000}, (error, result) => {
    if (error) {
      console.error(`${result.error} for ${req.body.url}`);
      res.status(500).send(`${result.error} for ${req.body.url}`);
    } else {
      res.json({
        url: result.ogUrl,
        title: result.ogTitle,
        description: result.ogDescription,
        image: result.ogImage?.url,
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
