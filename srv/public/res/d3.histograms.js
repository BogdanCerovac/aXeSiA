function generateHistogram(type, historicalCleaned){
    
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.timeParse("%d-%m-%Y");

    // set the ranges
    var x = d3.scaleTime()
        .domain([new Date(2010, 6, 3), new Date(2012, 0, 1)])
        .rangeRound([0, width]);
    var y = d3.scaleLinear()
        .range([height, 0]);

    // set the parameters for the histogram
    var histogram = d3.histogram()
    .value(function(d) { return d.date; })
    .domain(x.domain())
    .thresholds(x.ticks(d3.timeMonth));

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
        "translate(" + margin.left + "," + margin.top + ")");

    // get the data
    // format the data
    historicalCleaned.forEach(function(d) {
        d.ts = parseDate(d.dtg);
    });

    // group the data for the bars
    var bins = histogram(data);

    // Scale the range of the data in the y domain
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);

    // append the bar rectangles to the svg element
    svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", 1)
    .attr("transform", function(d) {
        return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
    .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
    .attr("height", function(d) { return height - y(d.length); });

    // add the x Axis
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
    .call(d3.axisLeft(y));
  


}

