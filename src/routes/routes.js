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



///////////// PETICIONES GET \\\\\\\\\\\\\\\\

app.get('/', (req, res) => {

   res.send(`Descargado 558855544877`)
});

// ------ LOGIN ------ \\

app.get('/login/:cedula', (req, res) => {

   const { cedula } = req.params;

   pool.getConnection((err, connection) => {
      if (err) throw err;

      const query = 'SELECT * FROM odontologos WHERE cedulas_odontologos = ?;';
      const query_data_prescripciones = 'SELECT * FROM vista_prescripcion VP RIGHT JOIN vista_lista_productos LP ON VP.id_prescirpciones = LP.id_prescirpciones WHERE cedulas_odontologos = ?;'

      connection.query(query, [cedula], async (error, results, fields) => {
         if (error) throw error;

         if (results[0].length !== 0) {

            let cedula_odontologo = results[0].cedulas_odontologos;

            let prescripciones = await new Promise((resolve) => {
               connection.query(query_data_prescripciones, [cedula_odontologo], (error, results, fields) => {

                  if (error) throw error;

                  let resultado = results;

                  for (let i = 0; i < resultado.length; i++) {
                     for (const property in resultado[i]) {
                        if (resultado[i][property] == null) {
                           delete resultado[i][property]
                        }
                     }
                  }
                  resolve(resultado);
               });
            });

            res.send({
               data: results[0],
               prescripciones
            })

         } else {
            res.send("No registrado");
         }

         connection.release();
      });
   });
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

///////////// PETICIONES POST \\\\\\\\\\\\\\\\

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

app.post('/add_odontologo', (req, res) => {

   const { cedula, nombre, apellido, telefono } = req.body;

   let query = 'INSERT INTO odontologos VALUES (NULL, ?, ?, ?, ?, NULL, NULL, NULL);';

   pool.getConnection((err, connection) => {

      if (err) throw err;

      connection.query(query, [cedula, nombre, apellido, telefono], (error, results, fields) => {

         res.status(200).send("Agregado")
         connection.release();

         if (error) throw error;
      });
   });
});

///////////// PETICIONES PUT \\\\\\\\\\\\\\\\

app.put('/put_odontologos', (req, res) => {
   
   const { id, cedula, nombre, apellido, telefono } = req.body;

   let query = 'UPDATE odontologos SET cedulas_odontologos = ?, nombres_odontologos = ?, apellidos_odontologos = ?, telefonos_odontologos = ? WHERE (id_odontologos = ?);';

   pool.getConnection((err, connection) => {

      if (err) throw err;

      connection.query(query, [cedula, nombre, apellido, telefono, id], (error, results, fields) => {

         res.status(200).send("Correcto")
         connection.release();

         if (error) throw error;
      });
   });

});

module.exports = app;