const fs = require('file-system');
const filePDF = require('html-pdf');
const qrcode = require("qrcode");
const path = require('path');
const isExist = require('./testExistFile');

const getFecha = (fecha) => {
   const fechaActual = new Date(fecha);
   const meses = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
   return (`${fechaActual.getDate()} - ${meses[fechaActual.getMonth()]} - ${fechaActual.getFullYear()}`);
}

const createQRCode = async (id) => {

   let url = `http://192.168.1.26:3100/get/prescriocion/${id}`

   let objOptions = {
      margin: 0
   }

   const QR = await qrcode.toDataURL(url, objOptions);
   return (QR);
}

const listaProductos = (lista) => {

   let arrProductos = [];
   let length_lista = 1;

   for (const property in lista) {
      if (lista[property] !== null) {
         if (property.split('_')[2] > length_lista) { length_lista = parseInt(property.split('_')[2]) }
      } else {
         delete lista[property]
      }
   }

   for (let i = 0; i < length_lista; i++) {

      let position = i + 1;

      let htmlProducto = `
         <td>
            <div class="productos">
               <table>
                  <tbody>
                     <tr>
                        <td>
                           <div class="imagen-productos">
                              <img class="imagenProducto"
                                 src="http://localhost:3100/img/prod/${lista[`prod_img_${position}`]}">
                           </div>
                        </td>
                        <td>
                           <div class="informacion-productos">
                              <h3 class="titulo-informacion">${lista[`prod_name_${position}`]}</h3>
                              <p class="descripcion-informacion">${lista[`prod_uso_${position}`]}</p>
                           </div>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </td>
         \n
      `;

      arrProductos.push(htmlProducto);

   }

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

   return (rowTables1);
}

const createPDF = (info) => {

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
         recomendaciones_prescirpciones,
         fecha_registro
      } = info.data

      let fileName = `${Date.parse(fecha_registro)}-prescirpcion.pdf`;

      let html = fs.readFileSync('./src/view/templete.html', 'utf8');
      let qr_code = await createQRCode(id_prescirpciones);

      let data = {
         '{{FECHA_ACTUAL}}': getFecha(fecha_registro),

         '{{CEDULA_PACIENTE}}': cedulas_pacientes,
         '{{NOMBRE_PACIENTE}}': nombres_pacientes,
         '{{APELLIDO_PACIENTE}}': apellidos_pacientes,

         '{{PRODUCTOS}}': listaProductos(info.productos),
         '{{RECOMENDACIONES}}': recomendaciones_prescirpciones,
         '{{CEDULA_DOCTOR}}': cedulas_odontologos,
         '{{NOMBRE_DOCTOR}}': `${nombres_odontologos} ${apellidos_odontologos}`,
         '{{TELEFONO_DOCTOR}}': telefonos_odontologos,
         '{{FIRMA_DOCTOR}}': "http://localhost:3100/img/sign/8155800369",
         '{{SELLO_DOCTOR}}': "http://localhost:3100/img/stamp/8155800369",
         '{{QR_INFORMATION}}': `${qr_code}`,
      }

      let options = {
         format: 'Letter'
      }

      html = html.replace(/{{FECHA_ACTUAL}}|{{CEDULA_PACIENTE}}|{{NOMBRE_PACIENTE}}|{{APELLIDO_PACIENTE}}|{{PRODUCTOS}}|{{RECOMENDACIONES}}|{{CEDULA_DOCTOR}}|{{NOMBRE_DOCTOR}}|{{TELEFONO_DOCTOR}}|{{QR_INFORMATION}}|{{FIRMA_DOCTOR}}|{{SELLO_DOCTOR}}/gi, (matched) => { return data[matched] })

      filePDF.create(html, options).toFile(path.join(__dirname, '../uploads/pdf') + `/${fileName}`, function (err, res) {
         if (err) return console.log(err);
         // console.log(res);
         resolve(fileName);
      });

   })
}

module.exports = createPDF;