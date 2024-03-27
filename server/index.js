const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const { extname, resolve } = require('path')
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/', express.static('assets'));

app.all('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
})

app.post('/upload', (req, res) => {
  const { name, type, size, fileName, uploadedSize } = req.body;
  const { file } = req.files

  if(!file) {
    return res.status(400).send('No files were uploaded.');
  }

  const filename = fileName + extname(name);
  const filePath = resolve(__dirname, `./assets/${filename}`);

  if(uploadedSize != '0') {
    // 不是第一个chunk 并且文件不存在，报错
    if(!fs.existsSync(filePath)) {
      res.send({
        code: 1001,
        msg: '文件不存在'
      })
      return
    }
    // 文件不是第一个 chunk，并且存在，append chunk
    fs.appendFileSync(filePath, file.data); // chunk的数据在 file.data
    res.send({
      code: 101,
      msg: 'append success!',
      data: {
        url: `http://localhost:${port}/${filename}`
      }
    });
    return
  } else {
    // 第一个chunk，写入文件
    fs.writeFileSync(filePath, file.data);
  }

  res.send({
    code: 200,
    msg: 'upload success',
    data: {
      url: `http://localhost:${port}/${filename}`
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});