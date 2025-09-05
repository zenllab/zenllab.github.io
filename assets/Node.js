const express = require('express');
const Dropbox = require('dropbox').Dropbox;
const fetch = require('isomorphic-fetch');
const bodyParser = require('body-parser');
require('dotenv').config(); // 환경 변수 사용

const app = express();

// 환경 변수로부터 Dropbox API 키를 가져옵니다.
const ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

// Express 미들웨어 설정
app.use(bodyParser.json());

// Dropbox 객체 초기화
const dbx = new Dropbox({ accessToken: ACCESS_TOKEN, fetch: fetch });

app.post('/upload', (req, res) => {
  const reportContent = req.body.content;
  const fileName = `report_${Date.now()}.txt`;  // 고유한 파일명 생성

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