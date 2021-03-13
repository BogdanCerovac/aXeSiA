exports.testTask = function(url, index) {
    const ms = Math.floor(Math.random() * 100); //random timeout 
    return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(`${index} (${url}) parsed within ${ms} ms`);
        }, ms);
    });
}