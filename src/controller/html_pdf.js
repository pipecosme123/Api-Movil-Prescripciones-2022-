const fs = require('file-system');
const filePDF = require('html-pdf');
const qrcode = require("qrcode");
const path = require('path');
const isExist = require('./testExistFile');

const Productos = [
   {
      "id": 0,
      "name": "cepillo colgate ultra soft",
      "uso": "111 Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi esse eligendi quasi impedit odio porro adipisci! Dicta qui ipsam deserunt sit, aspernatur nihil unde, nobis fugiat sed facere hic sapiente.",
      "img": '../contants/img/cepillo_ultrasoft.png',
   },
   {
      "id": 1,
      "name": "crema dental sensitive pro alivio",
      "uso": "222 Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi esse eligendi quasi impedit odio porro adipisci! Dicta qui ipsam deserunt sit, aspernatur nihil unde, nobis fugiat sed facere hic sapiente.",
      "img": '../contants/img/crema_sensitive.png',
   },
   {
      "id": 2,
      "name": "crema dental colgate periogard",
      "uso": "333 Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi esse eligendi quasi impedit odio porro adipisci! Dicta qui ipsam deserunt sit, aspernatur nihil unde, nobis fugiat sed facere hic sapiente.",
      "img": '../contants/img/crema_periogard.png',
   },
   {
      "id": 3,
      "name": "enjuague bucal colgate periogard 250ml",
      "uso": "444 Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi esse eligendi quasi impedit odio porro adipisci! Dicta qui ipsam deserunt sit, aspernatur nihil unde, nobis fugiat sed facere hic sapiente.",
      "img": '../contants/img/enjuague_periogard.png',
   }
]

const getFecha = (fecha) => {
   const fechaActual = new Date(fecha);
   const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
   return (`${fechaActual.getDate()} - ${meses[fechaActual.getMonth()]} - ${fechaActual.getFullYear()}`);
}

const createQRCode = async (id) => {

   let url = `http://localhost:3100/get/prescriocion/${id}`

   let objOptions = {
      margin: 0
   }

   const QR = await qrcode.toDataURL(url, objOptions);
   return (QR);
}

const listaProductos = (lista) => {

   let arrProductos = [];

   lista.forEach(id => {

      if (id !== null) {

         let lis_producto = Productos.filter(prd => prd.id === id)
// src="${lis_producto[0].img}" />
console.log();
      //    let htmlProducto = `
      //       <td>
      //          <div class="productos">
      //             <table>
      //                <tbody>
      //                   <tr>
      //                      <td>
      //                         <div class="imagen-productos">
      //                            <img class="imagenProducto"
                                    
      //                         </div>
      //                      </td>
      //                      <td>
      //                         <div class="informacion-productos">
      //                            <h3 class="titulo-informacion">${lis_producto[0].name}</h3>
      //                            <p class="descripcion-informacion">${lis_producto[0].uso}</p>
      //                         </div>
      //                      </td>
      //                   </tr>
      //                </tbody>
      //             </table>
      //          </div>
      //       </td>
      //    \n
      // `;

         arrProductos.push(htmlProducto);
      }
   });

   // let stringHtml = '';
   let rowTables1 = `
   <tr>
      ${arrProductos[0]}
      ${arrProductos[1] !== undefined ? arrProductos[1] : ''}
   </tr>
   <tr>
      ${arrProductos[2] !== undefined ? arrProductos[2] : ''}
      ${arrProductos[3] !== undefined ? arrProductos[3] : ''}
   </tr>
   <tr>
      ${arrProductos[4] !== undefined ? arrProductos[4] : ''}
      ${arrProductos[5] !== undefined ? arrProductos[5] : ''}
   </tr>
   <tr>
      ${arrProductos[6] !== undefined ? arrProductos[6] : ''}
      ${arrProductos[7] !== undefined ? arrProductos[7] : ''}
</tr>
   `;

   // for (var m in arrProductos) {
   //    stringHtml = stringHtml.concat(arrProductos[m]);
   // }  

   return (rowTables1);
}

const createPDF = (datos) => {

   return new Promise(async (resolve) => {

      const {
         id_prescirpciones,
         cedulas_odontologos,
         nombres_odontologos,
         apellidos_odontologos,
         telefonos_odontologos,
         cedulas_pacientes,
         nombres_pacientes,
         apellidos_pacientes,
         producto_1,
         producto_2,
         producto_3,
         producto_4,
         producto_5,
         producto_6,
         producto_7,
         producto_8,
         recomendaciones_prescirpciones,
         fecha_registro
      } = datos

      let fileName = `${Date.parse(fecha_registro)}-prescirpcion.pdf`;

      let html = fs.readFileSync('./src/view/templete.html', 'utf8');
      let qr_code = await createQRCode(id_prescirpciones);

      let list_productos = [
         { id: producto_1 },
         { id: producto_2 },
         { id: producto_3 },
         { id: producto_4 },
         { id: producto_5 },
         { id: producto_6 },
         { id: producto_7 },
         { id: producto_8 }
      ];

      let data = {
         '{{FECHA_ACTUAL}}': getFecha(fecha_registro),

         '{{CEDULA_PACIENTE}}': cedulas_pacientes,
         '{{NOMBRE_PACIENTE}}': nombres_pacientes,
         '{{APELLIDO_PACIENTE}}': apellidos_pacientes,

         '{{PRODUCTOS}}': listaProductos(list_productos),
         '{{RECOMENDACIONES}}': recomendaciones_prescirpciones,
         '{{CEDULA_DOCTOR}}': cedulas_odontologos,
         '{{NOMBRE_DOCTOR}}': `${nombres_odontologos} ${apellidos_odontologos}`,
         '{{TELEFONO_DOCTOR}}': telefonos_odontologos,
         '{{FIRMA_DOCTOR}}': `../uploads/sign/${cedulas_odontologos}-sign.jpg`,
         '{{SELLO_DOCTOR}}': `../uploads/stamp/${cedulas_odontologos}-stamp.jpg`,
         '{{QR_INFORMATION}}': `${qr_code}`,
      }

      let options = {
         format: 'Letter'
      }

      html = html.replace(/{{FECHA_ACTUAL}}|{{CEDULA_PACIENTE}}|{{NOMBRE_PACIENTE}}|{{APELLIDO_PACIENTE}}|{{PRODUCTOS}}|{{RECOMENDACIONES}}|{{CEDULA_DOCTOR}}|{{NOMBRE_DOCTOR}}|{{TELEFONO_DOCTOR}}|{{QR_INFORMATION}}|{{FIRMA_DOCTOR}}|{{SELLO_DOCTOR}}/gi, (matched) => { return data[matched] })

      filePDF.create(html, options).toFile(path.join(__dirname, '../uploads') + `/${fileName}`, function (err, res) {
         if (err) return console.log(err);
         // console.log(res);
         resolve(fileName);
      });

   })
}

module.exports = createPDF;