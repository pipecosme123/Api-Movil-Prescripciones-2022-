const express = require('express');
const fs = require('file-system');
const path = require('path');
const multer = require('multer');
const sharp = require("sharp");

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
      cb(null, `${file.originalname}`)
   }
})

const upload = multer({ storage: storage })

// Comprimir Imagenes
const comprimirImagenes = async (url_img) => {

   let filename_compress = url_img.split('.')[0] + "_compress.jpg";
   let filename_original = url_img.split('.')[0] + ".jpg";

   try {
      await sharp(url_img)
         .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
         .toFormat("jpeg", { mozjpeg: true, quality: 20 })
         .toFile(filename_compress);
   } catch (error) {
      console.log(error);
   }

   fs.unlinkSync(url_img, (err) => {
      if (err) {
         res.status(500).send('No se pudo eliminar')
         throw err;
      } else {
         console.log('Eliminado');
      };
   });

   fs.renameSync(filename_compress, filename_original);

   return filename_original;
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
app.get('/download/:id', async (req, res) => {
   const { id } = req.params;
   const file = `${__dirname}/src/uploads/pdf/${id}`;
   res.download(file);
});

// Cargar las imagenes de las firmas y sellos de los odontólogos
app.put('/images/:id', upload.array('imagenes'), async (req, res) => {

   const { id } = req.params;

   let filename_sign = await comprimirImagenes(req.files[0].path);
   let filename_stamp = await comprimirImagenes(req.files[1].path);

   let sing = filename_sign.split('\\')[filename_sign.split('\\').length - 1];
   let stamp = filename_stamp.split('\\')[filename_stamp.split('\\').length - 1];

   let query = "UPDATE odontologos SET img_firmas_odontologos=?, img_sellos_odontologos=? WHERE (id_odontologos=?);";

   pool.getConnection((err, connection) => {

      if (err) throw err;

      connection.query(query, [sing, stamp, id], (error, results, fields) => {

         res.status(200).send("Cargadas")
         connection.release();

         if (error) throw error;
      });
   });

});

// Eliminar los archivos pdf
app.delete('/delete/:id', async (req, res) => {

   const { id } = req.params;
   const file = path.join(__dirname, '..', `/uploads/pdf/${id}`)

   fs.unlinkSync(file, (err) => {
      // if (err) throw err
   });

   res.status(200).send('Eliminado');

});

module.exports = app;