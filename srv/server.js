var express = require('express');
const handlebars = require('express-handlebars');
var app = express();
var path = require('path');

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



app.get('/', function (req, res, next) {

    console.log(new Date().toISOString() + ' Request URL:', req.originalUrl);

    res.render('home', {
        titleEnd: "home",
        helpers: {
            foo: function () { return 'foo.'; },
            bar: function () { return 'bar.'; }
        },
        data: function(){
            return JSON.stringify([
                {
                    name: "Test 1",
                    value: 1
                },
                {
                    name: "Test 2",
                    value: 2
                },
                {
                    name: "Test 3",
                    value: 3
                }
            ])
        }
    });
});

// start server
app.listen(PORT, () => {
  console.log('Server connected at:',PORT);
});