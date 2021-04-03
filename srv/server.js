const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require('path');
const { truncateDecimals } = require('../util/helpers')

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
    console.log("req.query.details: ", req.query.details ? req.query.details : "not provided!")

    let dataFromDB = getAllReports();
    //console.log(dataFromDB)

    if(req.query && req.query.details){

        dataFromDB = getAllReports(req.query.details);

        const domainData = dataFromDB.filter( data => data.domain === req.query.details)[0];
        //console.log(domainData.lhSummary)

        if(domainData && domainData.domain){
            res.render('details', {
                titleEnd: "Latest audit details for " + req.query.details,
                details: req.query.details,
                distinctUrlsCount: domainData.distinctUrlsCount,
                dateTimeLatest: domainData.dateTimeLatest,
                axeSummary : domainData.axeSummary,
                siSummary: domainData.siSummary,
                lhSummary: domainData.lhSummary,
                totalStats: domainData.totalStats,
                historicalSummariesFlatPerUrl: domainData.historicalSummariesFlatPerUrl,
                historicalSummariesFlatPerUrlString: JSON.stringify(domainData.historicalSummariesFlatPerUrl),
                domainDataAsString : JSON.stringify(domainData.summaryByDomain[req.query.details]),
                helpers: {
                    decimalToPercent: function (decimal) { return truncateDecimals(decimal * 100, 4); },
                    timestamp: function() {return new Date().getTime();},
                    heightPerUrl : function(items, heightPerItem) {return items * heightPerItem}
                }
            })
        }else{
            res.render('error', {
                titleEnd: "error",
                errorEnd: " looks like domain does not have any audit",
                errorText: "Please verify if the domain has audits!"
            })
        }

        

    }else{
        res.render('home', {
            titleEnd: "main overview",
            domains: dataFromDB,
            helpers: {
                decimalToPercent: function (decimal) { return truncateDecimals(decimal * 100, 4); },
                timestamp: function() {return new Date().getTime();}
            }
        })
    }

    

});

// start server
app.listen(PORT, () => {
  console.log('Server connected at:',PORT);
});