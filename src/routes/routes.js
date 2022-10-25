const express = require('express');
const fs = require('file-system');

const pool = require('../database/conexion_db.js');
const createPDF = require('../controller/html_pdf');
const isExist = require('../controller/testExistFile');

const app = express();

app.use(express.urlencoded({
   extended: false
}));
app.use(express.json());

app.get('/', (req, res) => {

   res.send(`Descargado 558855544877`)
});

app.get('/img', (req, res) => {

   createPDF()
});

app.get('/get/prescriocion/:id_prescripcion', (req, res) => {

   const { id_prescripcion } = req.params;

   pool.getConnection(async (err, connection) => {
      if (err) throw err;

      const query_prescripcion_pdf = 'SELECT * FROM vista_prescripcion WHERE id_prescirpciones = ?;'

      connection.query(query_prescripcion_pdf, [id_prescripcion], (error, results, fields) => {
         if (error) throw error;

         res.send(results[0]);

         connection.release();
      })

   })
});

app.get('/files/:id', async (req, res) => {

   const { id } = req.params;
   const file = `${__dirname}/src/uploads/${id}`;
   res.download(file);
   // res.send(`Descargado ${file}`)
});

app.post('/addPrescripcion', async (req, res) => {

   const {
      cedula_paciente,
      nombre_paciente,
      apellido_paciente,
      productos,
      recomendaciones,
      cedula_odontologo,
   } = req.body

   const query_addPrescripcion = 'CALL add_prescripcion(?,?,?,?,?);';
   const query_addProductos = 'INSERT INTO lista_productos (id_prescripcion, id_producto_selecionado) VALUES (?,?);';
   const query_prescripcion_pdf = 'SELECT * FROM vista_prescripcion WHERE id_prescirpciones = ?;'

   let resultadoAPI = await new Promise((resolve) => {

      pool.getConnection(async (err, connection) => {

         if (err) throw err;

         let id_prescripcion = await new Promise((resolve) => {
            connection.query(query_addPrescripcion, [cedula_paciente, nombre_paciente, apellido_paciente, cedula_odontologo, recomendaciones], (error, results, fields) => {

               if (error) throw error;

               let id_prescirpciones = results[0][0]['id_prescirpciones'];

               for (let i = 0; i < productos.length; i++) {
                  connection.query(query_addProductos, [id_prescirpciones, productos[i].id], function (error, results, fields) {
                     if (error) throw error;
                  });
               }
               resolve(id_prescirpciones);
            });
         })

         let data_prescripcion = await new Promise((resolve) => {
            connection.query(query_prescripcion_pdf, [id_prescripcion], (error, results, fields) => {
               if (error) throw error;
               resolve(results[0]);
            })
         });

         resolve(data_prescripcion);

         connection.release();

      });
   })

   let htmlPdf = await createPDF(resultadoAPI);

   let valor = await isExist(htmlPdf);

   console.log('htmlPdf', htmlPdf);
   console.log('valor', valor);

   if (valor) {
      res.send(htmlPdf);
   }
   else {
      res.send(`Error`)
   }
});


module.exports = app;