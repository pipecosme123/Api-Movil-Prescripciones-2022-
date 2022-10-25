const fs = require("file-system");

const isExist = (directionFile) => {

   return new Promise((resolve) => {
      fs.access(`./src/uploads/${directionFile}`, fs.constants.F_OK, (err) => {

         console.log(directionFile);
         if (err) {
            resolve(false);
         }
         else {
            resolve(true);
         }
      });
   });

}

module.exports = isExist;