const fs = require('fs');

exports.sleep = function(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

exports.createFolderIfNotFound = function(folderPath){
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

exports.cleanURL = function(url){
    return url.replace(/[^a-zA-Z]/g, '_');
}

exports.todaysDate = function(){
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; 
    const yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 
  
    if(mm<10) 
    {
        mm='0'+mm;
    } 
  
    return yyyy + "-" + mm + "-" + dd;
}