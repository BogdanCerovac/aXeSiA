const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require('path');

const {aXeReports} = require('./provideReports');


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

    res.render('home', {
        titleEnd: "home",
        helpers: {
            foo: () => { return 'foo.'; },
            bar: () => { return 'bar.'; }
        },
        data: function(){
            return JSON.stringify(aXeReports())
        }
    });
});

// start server
app.listen(PORT, () => {
  console.log('Server connected at:',PORT);
});