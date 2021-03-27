const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require('path');

const {getAllReports} = require('./provideReports');


const PORT = process.env.PORT || 80;

// Simple log
/*app.use(function (req, res, next) {
    console.log(new Date().toISOString() + ' Request URL:', req.originalUrl);
    next()
})*/

// Serve Static Assets
app.use('/res', express.static(path.join(__dirname, 'public/res')));

// Handlebars
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,'/handlebars'));



app.get('/', (req, res, next) => {

    console.log(new Date().toISOString() + ' Request URL:', req.originalUrl);

    const dataFromDB = getAllReports();

    res.render('home', {
        titleEnd: "home",
        axeSummary : JSON.stringify(dataFromDB.axeSummary),
        lighthouseSummary: JSON.stringify(dataFromDB.lighthouseSummary),
        data: JSON.stringify(dataFromDB.summaryByUrl)
    });
});

// start server
app.listen(PORT, () => {
  console.log('Server connected at:',PORT);
});