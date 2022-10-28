const express = require('express');
const fs = require('file-system');
const path = require('path');
const multer = require('multer');
let imagemin = import("imagemin")
// const imageminJpegtran = require('imagemin-jpegtran');
// const pngToJpeg = require('png-to-jpeg');

const pool = require('../database/conexion_db.js');

const app = express();

app.use(express.urlencoded({
   extended: false
}));
app.use(express.json());


const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      let typeImg = file.originalname.split('_')[0];
      if (typeImg === 'sign') {
         cb(null, path.join(__dirname, '..', 'uploads/sign'))
      } else {
         cb(null, path.join(__dirname, '..', 'uploads/stamp'))
      }
   },
   filename: function (req, file, cb) {
      let typeImg = file.originalname.split('_')[0];
      if (typeImg === 'sign') {
         cb(null, path.join(__dirname, '..', 'uploads/sign'))
      } else {
         cb(null, path.join(__dirname, '..', 'uploads/stamp'))
      }
      cb(null, `${file.originalname}`)
   }
})

const upload = multer({ storage: storage })

// Comprimir Imagenes
const comprimirImagenes = async (url_img) => {

   await imagemin(url_img, {
      destination: path.join(__dirname, '..', '/uploads/upload'),
      plugins: [
         imageminJpegtran(),
         pngToJpeg({ quality: 90 })
      ]
   });
}


// Obtener las imagenes de las firmas y sellos de los odontólogos, adicional, las imagenes de los productos de colgate
app.get('/img/:type/:name', (req, res) => {

   const { type, name } = req.params;

   let fileName = path.join(__dirname, '..', `/uploads/${type}/${name}-${type}.jpg`);

   res.sendFile(fileName, function (err) {
      if (err) console.log(err);
   });
});

// Descargar los archivos .pdf
app.get('/files/:id', async (req, res) => {
   const { id } = req.params;
   const file = `${__dirname}/src/uploads/${id}`;
   res.download(file);
});

// Cargar las imagenes de las firmas y sellos de los odontólogos
app.post('/files', upload.array('imagenes'), (req, res) => {

   // fs.renameSync(req.files[0].path, "req.files[0].path" + '.' + req.files[0].mimetype.split('/')[1]);
   // fs.renameSync(req.files[1].path, "req.files[1].path" + '.' + req.files[1].mimetype.split('/')[1]);
   // const { cedula } = req.body;
   // const img_sign = req.files[0];
   // const img_stamp = req.files[1];

   // fs.renameSync(img_sign.path, `${'cedula'}-sign.${img_sign.mimetype.split('/')[1]}`);
   // fs.renameSync(img_stamp.path, `${'cedula'}-sign.${img_stamp.mimetype.split('/')[1]}`);


   // comprimirImagenes(img_sign);
   // comprimirImagenes(img_stamp);

   res.send(req.files[0].path);

   // let newPathSign = path.join(__dirname, '..', '/uploads/sign')
   // let newPathStamp = path.join(__dirname, '..', '/uploads/stamp')

   // fs.renameSync(img_sign.path, `${newPathSign}/${cedula}-sign.${img_sign.mimetype.split('/')[1]}`);

   // fs.rename(oldPath, newPath, function (err) {
   //    if (err) throw err
   //    console.log('Successfully renamed - AKA moved!')
   // })

   // const { id } = req.params;
   // const file = `${__dirname}/src/uploads/${id}`;
   // res.download(file);
});

module.exports = app;