const { unlink } = require('fs');

const deleteFiles = (fileName) => {

   let fileNameDelete = `./src/uploads/${fileName}`

   unlink(fileNameDelete, (err) => {
      if (err) {
         console.error(err)
         return
      }
      console.log(`eliminado el archivo ${fileName}`);
   })
}

module.exports = deleteFiles;