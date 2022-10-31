const express = require('express');
const morgan = require('morgan');
const routes = require(__dirname + '/src/routes/routes.js');
const files = require(__dirname + '/src/routes/files.js');

const app = express();
const PORT = 3100;

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(routes);
app.use(files);

app.use(function (err, req, res, next) {
   console.error(err.stack);
   res.status(500).send(err.stack);
});

app.listen(PORT, () => {
   console.log(`Server on port ${PORT}`);
});