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

//url as id has to be cleaned
function cleanUrl(url){
    return url.replace(/[^a-zA-Z]/g, '_');
}


// can be used for all accessibility reports, as long as they respect same data structure and naming
function renderDetailsForA11y(details, type){
    let violationsHTML = `<p>Violations: ${details.violations}</p>`;
    if(details.violationsImpacts.length > 0){
        violationsHTML += `<p>Violation impacts:</p><ul>`;
        let violationImpacts = '';
        details.violationsImpacts.map(impact => violationImpacts += `<li>${impact}</li>`);
        violationsHTML += `${violationImpacts}</ul>`;
    }

    if(details.violationsTags.length > 0){
        violationsHTML += `<p>Violation tags:</p><ul>`;
        let violationTags = '';
        details.violationsTags.map(tag => violationTags += `<li>${tag}</li>`);
        violationsHTML += `${violationTags}</ul>`;
    }

    const total = [details.passes, details.incomplete, details.inapplicable, details.violations].map( num => !isNaN(num) && num >= 0 ? num : 0  ).reduce(function(a, b) { return a + b; }, 0);

    return `
    <div class="details ${type}-details">
        <p>Time: ${details.time} ms</p>
        <p>Passes: ${details.passes}</p>
        ${violationsHTML}
        <p>Incomplete: ${details.incomplete}</p>
        <p>Inapplicable: ${details.inapplicable}</p>
        <p>Total: ${total}</p>
    </div>
  `;
}


function typeToTitleString(type){
    switch (type) {
        case 'axe':
            return 'aXe';
        case 'si':
            return 'Siteimprove';
        case 'lh':
            return 'Lighthouse';
        default:
            console.error(`typeToTitleString ${type} not supported yet`);
            return  `${type} not supported yet`; 
    }
}

//render details for all types together
function renderDetailsForAllTypes(details){

    const keys = Object.keys(details).filter( item => item !== "id" && item !== "ts");

    let toRender = '';
    keys.map( key => {
        if(details.hasOwnProperty(key)){
            toRender += `<h4>${typeToTitleString(key)}</h4>`;
            toRender += renderDetailsPerType(details[key], key);
        }else{
            console.error(key + " not found in ", details)
        }
        return;
    });

    return toRender;

}

//render details based on one type
function renderDetailsPerType(details, type){
 
    // TODO
    switch (type) {
        case 'axe': 
            return renderDetailsForA11y(details, type);
        case 'si':
            return renderDetailsForA11y(details, type);
        case 'lh':
            return `
            <div class="details ${type}-details">
                <p>Time: ${details.time} ms</p>
                <p>Accessibility: ${details.A11y}</p>
                <p>SEO: ${details.SEO}</p>
                <p>Performance: ${details.Performance}</p>
                <p>BestPractices: ${details.BestPractices}</p>
            </div>
          `;
       
        default:
          console.warn(`Sorry, ${type} not supported yet.`);
          return `<p style="color:red">Sorry, ${type} not supported yet.</p>`;
      }
}


// generate details based on class and id
function generateDetails(type, data){
    let out = '';
    for(const url in data){
        const meta = data[url];

        let details = '';
        const metaSorted = meta.sort((a, b) => (new Date(a.ts).getTime() < new Date(b.ts).getTime()) ? 1 : -1)
        metaSorted.map( detail => {
            let subDetails = '';
            if(type === "all"){
                subDetails = renderDetailsForAllTypes(detail, type);
            }else{
                subDetails = renderDetailsPerType(detail[type], type);
            }
            details += `<details class="details-sub-trigger">
            <summary>${detail.ts}</summary>
                <div class="details-sub">
                <pre style="white-space: break-spaces;">${JSON.stringify(detail)}</pre>
                ${subDetails}
                </div>
            </details>`;
        })
         
        out += `
        <details class="details-main-trigger" id="${type}---${cleanUrl(url)}">
            <summary>${url}</summary>
            <div class="details-main">${details}</div>
        </details>
        `;
        
    }
    return out;
}


document.querySelectorAll('.js_generate_details').forEach( details => {
    const type = details.id.split("_")[1];
    details.innerHTML = generateDetails(type, dataCleaned);
})