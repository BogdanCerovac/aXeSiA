'use strict';

// external links
function addNoOpener(link) {
    let linkTypes = (link.getAttribute('rel') || '').split(' ');
    if (!linkTypes.includes('noopener')) {
      linkTypes.push('noopener');
    }
    link.setAttribute('rel', linkTypes.join(' ').trim());
}
  
function addNewTabMessage(link) {
    if (!link.querySelector('.screen-reader-only')) {
      link.insertAdjacentHTML('beforeend', '<span class="screen-reader-only">(opens in a new tab)</span>');
    }
}
  
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    addNoOpener(link);
    addNewTabMessage(link);
});


//render details based on type
function renderDetails(details, type){
    // TODO
}


// generate details based on class and id
function generateDetails(type, data){
    /*console.log(data)
    */
    let out = '';
    for(const key in data){
        const meta = data[key];

        let details = '';
        const metaSorted = meta.sort((a, b) => (new Date(a.ts).getTime() < new Date(b.ts).getTime()) ? 1 : -1)
        metaSorted.map( detail => {

            details += `<details class="details-sub-trigger">
            <summary>${detail.ts}</summary>
                <div class="details-sub">
                ${JSON.stringify(detail[type])}
                </div>
            </details>`;
        })
         
        out += `
        <details class="details-main-trigger">
            <summary>${key}</summary>
            <div class="details-main">${details}</div>
        </details>
        `;
        
    }
    return out;
/*
    const template = `
        <button type="button" id="${id}">${name}</button>
    `;*/
}


document.querySelectorAll('.js_generate_details').forEach( details => {
    const type = details.id.split("_")[1];
    console.log(type);
    details.innerHTML = generateDetails(type, dataCleaned);
})