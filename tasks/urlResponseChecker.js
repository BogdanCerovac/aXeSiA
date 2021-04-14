const http = require('http');
const url = require('url');

const goodHTTPresponses = [
    200,
    301,
    302
];


module.exports = function(Url) {

  return new Promise((resolve, reject) => {
    try{

        const { href, host, pathname:path, port } = new URL(Url);
        const options = {
            method: 'HEAD',
            host,
            port,
            path
        };

        const req = http.request(options, function (r) {
            if(goodHTTPresponses.indexOf(r.statusCode) > -1 ){
                resolve(true);
            }else{
                resolve(r.statusCode);
            }
        });

        req.on('error', function (e) {
            // General error, i.e.
            //  - ECONNRESET - server closed the socket unexpectedly
            //  - ECONNREFUSED - server did not listen
            //  - HPE_INVALID_VERSION
            //  - HPE_INVALID_STATUS
            //  - ... (other HPE_* codes) - server returned garbage
            //console.log(e.message);
            resolve(e);
        });
          
        req.on('timeout', function () {
            // Timeout happend. Server received request, but not handled it
            // (i.e. doesn't send any response or it took to long).
            // You don't know what happend.
            // It will emit 'error' message as well (with ECONNRESET code).
          
            //console.log('timeout');
            resolve('timeout');
            req.destroy();
        });
          
        req.setTimeout(5000);

        req.end();

    }catch(error){
        //reject(error);
        resolve(error);
    }

});
  
}
