function generateHistogram(element, type, data){

    const widthSvg = 800;
    const heightSvg = 600;
    
    var tip = d3.select(element)
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

        const svg = d3.create("svg");
        svg.attr("class", "background-style");
        
    const margin = {top: 40, right: 20, bottom: 20, left: 60};
    const width = +widthSvg - (margin.left + margin.right);
    const height = +heightSvg - (margin.top + margin.bottom);

    svg.attr("viewBox", "0 0 " + (widthSvg + 20)  + " " + (heightSvg + 20));
    svg.attr("width", width);
    svg.attr("height", height);

    d3.select(element).append(() => svg.node());

var x = d3.scaleBand().rangeRound([0, width]).padding(0.15),
    y = d3.scaleLinear().rangeRound([height, 0.5]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  
  x.domain(data.map(function(d) { return d.date; }));

  const maxY = d3.max(data, function(d) { return d[type]; })
  y.domain([0, maxY]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
   .append("text")
   .attr("class", "axis-text")
      .attr("y", 6)
      .attr("dy", "1.5em")
      .attr("dx", width/2 - margin.left)
      .attr("text-anchor", "start")
      .text("Date");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
    .append("text")
    .attr("class", "axis-text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text(type);
 

  const graph = g.selectAll(".bar")
    .data(data)
    .enter();

    graph.append("rect")
    .attr("tabindex", "0")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.date); })
    .attr("y", function(d) { return y(d[type]); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d[type])})
    .on(["focus","hover"], function(d) {return tip.text(d[type]).style("visibility", "visible").style("top", y(d[type]) - 13+ 'px' ).style("left", x(d.date) + x.bandwidth() - 12 + 'px')})
    //.on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
    .on(["blur","mouseout"], function(){return tip.style("visibility", "hidden");})
    
    graph.append("text")
    .attr("x", function(d) { return x(d.date) + x.bandwidth()/2; })
    .attr("y", function(d) { return height - ((y(d[type]) + 20) ) })
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central") 
    .attr("class", "labelled")
    .text(function(d) { return d[type]; });
   

}

