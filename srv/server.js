var express = require('express');
var app = express();
var path = require('path');


const PORT = process.env.PORT || 80;


// Simple log
app.use(function (req, res, next) {
    console.log(new Date().toISOString() + ' Request URL:', req.originalUrl);
    next()
})

// Serve Static Assets
app.use('/', express.static(path.join(__dirname, 'public')));


// start server
app.listen(PORT, () => {
  console.log('Server connected at:',PORT);
});