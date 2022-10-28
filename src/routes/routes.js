const express = require('express');
const fs = require('file-system');
const path = require('path');

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
   const query_data_prescripcion = 'SELECT * FROM vista_prescripcion WHERE id_prescirpciones = ?;'
   const query_data_lista_productos = 'SELECT * FROM vista_lista_productos WHERE id_prescirpciones = ?;'

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
            connection.query(query_data_prescripcion, [id_prescripcion], (error, results, fields) => {
               if (error) throw error;
               resolve(results[0]);
            })
         });

         let data_list_productos = await new Promise((resolve) => {
            connection.query(query_data_lista_productos, [id_prescripcion], (error, results, fields) => {
               if (error) throw error;
               resolve(results[0]);
            })
         });

         resolve({
            data: data_prescripcion,
            productos: data_list_productos
         });

         connection.release();

      });
   })

   // let htmlPdf = await createPDF(req.body);
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