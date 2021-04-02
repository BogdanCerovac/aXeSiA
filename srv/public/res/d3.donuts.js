
'use strict';

//creds: https://bl.ocks.org/mbhall88/22f91dc6c9509b709defde9dc29c63f2


const donuts = document.getElementsByClassName("js_generate_donut");
const donuts_len = donuts.length;
for(let i = 0; i < donuts_len; i++){
    const singleDonutHolder = donuts[i];
    const id = singleDonutHolder.id;
    const dataId = "graph_data_a11y____" + id.split("____")[1];
    const dataRaw = document.getElementById(dataId).innerText.trim().replace(/\r?\n|\r\s/g, '');
    const data = JSON.parse(dataRaw).filter( item => item.score !== 0.0);
    const donut = donutChart()
    .data(data)
    .uid(id)
    .width(800)
    .height(800)
    .cornerRadius(5) // sets how rounded the corners are on each slice
    .padAngle(0.025) // effectively dictates the gap between slices
    .variable('score')
    .category('category');

    d3.select('#'+id)
    .call(donut);
}


function donutChart() {
       let data = [],
           uid,
           width,
           height,
           margin = {top: 10, right: 10, bottom: 10, left: 10},
           colour = d3.scaleOrdinal(d3.schemeCategory20c), // colour scheme
           variable, // value in data that will dictate proportions on chart
           category, // compare data by
           padAngle, // effectively dictates the gap between slices
           floatFormat = d3.format('.4r'),
           cornerRadius, // sets how rounded the corners are on each slice
           percentFormat = d3.format(',.4%');
   
       function chart(selection){
           selection.each(function() {
               // generate chart
               // ===========================================================================================
               // Set up constructors for making donut. See https://github.com/d3/d3-shape/blob/master/README.md
               const radius = Math.min(width, height) / 2;
   
               // creates a new pie generator
               const pie = d3.pie()
                   .value(function(d) { if(d[variable] !== 0){ return floatFormat(d[variable]);} })
                   .sort(null);
   
               // contructs and arc generator. This will be used for the donut. The difference between outer and inner
               // radius will dictate the thickness of the donut
               const arc = d3.arc()
                   .outerRadius(radius * 0.8)
                   .innerRadius(radius * 0.5)
                   .cornerRadius(cornerRadius)
                   .padAngle(padAngle);
   
               // this arc is used for aligning the text labels
               const outerArc = d3.arc()
                   .outerRadius(radius * 0.9)
                   .innerRadius(radius * 0.9);
               // ===========================================================================================
   
               // ===========================================================================================
               // append the svg object to the selection
               // var svg = selection.append('svg')
               const svg = selection.append('svg')
                   .attr('width', width + margin.left + margin.right)
                   .attr('height', height + margin.top + margin.bottom)
                   .attr('viewBox', ' 0 0 ' +width + ' ' +height)
                   .attr('preserveAspectRatio', 'xMinYMin meet')
                   .attr('focusable', 'false')
                 .append('g')
                   .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
               // ===========================================================================================
   
               // ===========================================================================================
               // g elements to keep elements within svg modular
               svg.append('g').attr('class', 'slices');
               svg.append('g').attr('class', 'labelName');
               svg.append('g').attr('class', 'lines');
               // ===========================================================================================
   
               // ===========================================================================================
               // add and colour the donut slices
               const path = svg.select('.slices')
                   .selectAll('path')
                   .data(pie(data))
                 .enter().append('path')
                   /*.attr('fill', function(d) { return d.data["color"]; })*/
                   .attr('fill', function(d) { return 'url(#pattern_' + d.data["color"] + ')'})
                   .attr('aria-labelledby', function(d) { return 'label_' + uid + '_' + d.data["category"]})
                   .attr('stroke', 'black')
                   /*.attr('id', function(d) { return d.data["id"]; })*/
                   .attr('d', arc);
               // ===========================================================================================
   
               // ===========================================================================================
               // add text labels
               const label = svg.select('.labelName').selectAll('text')
                   .data(pie(data))
                 .enter()
                    .append('g')
                    .append('text')
                        .attr('dy', '.35em')
                        .html(updateLabelText)
                        .attr('transform', labelTransform)
                        .attr('class', 'textLabel')
                        .attr('id',function(d) { return 'label_' + uid + '_' +  d.data["category"]})
                        .style('text-anchor', function(d) {
                            // if slice centre is on the left, anchor text to start, otherwise anchor to end
                            return (midAngle(d)) < Math.PI ? 'start' : 'end';
                        })
                       
                        .insert('rect')
                        .attr('transform', labelTransform)
                        .attr('width', 20)
                        .attr('height', 20)
                        .attr('fill', function(d) { return 'url(#pattern_' +  d.data["color"] + ")"} )
                        
                    
               // ===========================================================================================
   
               // ===========================================================================================
               // add lines connecting labels to slice. A polyline creates straight lines connecting several points
               const polyline = svg.select('.lines')
                   .selectAll('polyline')
                   .data(pie(data))
                 .enter().append('polyline')
                   .attr('points', calculatePoints);
               // ===========================================================================================
   
               // ===========================================================================================
               // add tooltip to focus events on slices and labels - TODO
               // d3.selectAll('.labelName text, .slices path').call(toolTip);
               // ===========================================================================================
   
               // ===========================================================================================
              
               // ===========================================================================================
               // Functions
               // calculates the angle for the middle of a slice
               function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }
   
               // function that creates and adds the tool tip to a selected element
               function toolTip(selection) {
   
                   // add tooltip (svg circle element) when mouse enters label or slice
                   selection.on('focus', function (data) {
                        //console.log(data)
   
                       svg.append('text')
                           .attr('class', 'toolCircle')
                           .attr('dy', 0) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                           .html(toolTipHTML(data)) // add text to the circle.
                           .style('font-size', '1.1em')
                           .style('text-anchor', 'middle'); // centres text in tooltip
   
                       svg.append('circle')
                           .attr('class', 'toolCircle')
                           .attr('r', radius * 0.45) // radius of tooltip circle
                           .style('fill', data.data["color"]) // colour based on category mouse is over
                           .style('fill-opacity', 0.15);
   
                   });
   
                   // remove the tooltip when mouse leaves the slice/label
                   selection.on('blur', function () {
                       d3.selectAll('.toolCircle').remove();
                   });
               }
   
               // function to create the HTML string for the tool tip. Loops through each key in data object
               // and returns the html string key: value
               function toolTipHTML(data) {
   
                   let tip = '',
                       i   = 0;
   
                   for (let key in data.data) {
                   
                       if(key !== "color"){
                     
                     
   
                       // if value is a number, format it as a percentage
                       const value = (!isNaN(parseFloat(data.data[key]))) ? percentFormat(data.data[key]) : data.data[key];
   
                       // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
                       // tspan effectively imitates a line break.
                       if (i === 0) tip += '<tspan x="0">' + key + ': ' + value + '</tspan>';
                       else tip += '<tspan x="0" dy="1.2em">' + key + ': ' + value + '</tspan>';
                       i++;
                      }
                   }
   
                   return tip;
               }
   
               // calculate the points for the polyline to pass through
               function calculatePoints(d) {
                   // see label transform function for explanations of these three lines.
                   const pos = outerArc.centroid(d);
                   pos[0] = radius * 0.25 * (midAngle(d) < Math.PI ? 1 : -1);
                   return [arc.centroid(d), outerArc.centroid(d), pos]
               }
   
               function labelTransform(d) {
                   // effectively computes the centre of the slice.
                   // see https://github.com/d3/d3-shape/blob/master/README.md#arc_centroid
                   const pos = outerArc.centroid(d);
   
                   // changes the point to be on left or right depending on where label is.
                   pos[0] = radius * 0.25 * (midAngle(d) < Math.PI ? 1 : -1);
                   return 'translate(' + pos + ')';
               }
   
               function updateLabelText(d) {
                   return d.data[category] + ': <tspan>' + percentFormat(d.data[variable]) + '</tspan>';
               }
   
   
               // ===========================================================================================
   
           });
       }
   
       // getter and setter functions. See Mike Bostocks post "Towards Reusable Charts" for a tutorial on how this works.
       chart.width = function(value) {
           if (!arguments.length) return width;
           width = value;
           return chart;
       };
   
       chart.height = function(value) {
           if (!arguments.length) return height;
           height = value;
           return chart;
       };
   
       chart.margin = function(value) {
           if (!arguments.length) return margin;
           margin = value;
           return chart;
       };
   
       chart.radius = function(value) {
           if (!arguments.length) return radius;
           radius = value;
           return chart;
       };
   
       chart.padAngle = function(value) {
           if (!arguments.length) return padAngle;
           padAngle = value;
           return chart;
       };
   
       chart.cornerRadius = function(value) {
           if (!arguments.length) return cornerRadius;
           cornerRadius = value;
           return chart;
       };
   
       chart.colour = function(value) {
           if (!arguments.length) return colour;
           colour = value;
           return chart;
       };
   
       chart.variable = function(value) {
           if (!arguments.length) return variable;
           variable = value;
           return chart;
       };
   
       chart.category = function(value) {
           if (!arguments.length) return category;
           category = value;
           return chart;
       };
   
       chart.data = function(value) {
           if (!arguments.length) return data;
           data = value;
           if (typeof updateData === 'function') updateData();
           return chart;
       };

       chart.uid = function(value) {
            if (!arguments.length) return uid;
            uid = value;
            return chart;
        };
   
       return chart;
}
