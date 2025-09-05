const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const bodyParser = require('body-parser');
const cors = require('cors'); // ✨ cors 패키지 추가
require('dotenv').config();

const app = express();

const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

// Express 미들웨어 설정
app.use(cors()); // ✨ CORS 미들웨어 사용
app.use(bodyParser.json());

const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch: fetch });

app.post('/upload', (req, res) => {
  const reportContent = req.body.content;
  const fileName = `report_${Date.now()}.txt`;
  
  dbx.filesUpload({ path: `/${fileName}`, contents: reportContent })
    .then(response => {
      res.json({ success: true, data: response });
    })
    .catch(error => {
      res.json({ success: false, error: error });
    });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});