function generateHistogram(element, type, data){

    const widthSvg = 800;
    const heightSvg = 1000;
    
    var tip = d3.select(element)
        .append("div")
        .attr("class", "tip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");

        const svg = d3.create("svg");
        svg.attr("class", "background-style");
        
    const margin = {top: 20, right: 10, bottom: 60, left: 150};
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

  let maxY = d3.max(data, function(d) { return d[type]; });

  //some margin
  if(parseInt(maxY, 10) < 100){
    const maxYInt = parseInt(maxY, 10);
    maxY = Math.round(maxYInt + ( maxYInt * 15) / 100);
  }

  console.log(maxY)
  y.domain([0, maxY]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
   .append("text")
   
      .attr("y", 10)
      .attr("dy", "2em")
      .attr("dx", width/2)
      .attr("class", "axis-text")
      .attr("text-anchor", "start")
      .text("Date");

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(13))
    .append("text")
    
      .attr("transform", "rotate(-90)")
      .attr("class", "axis-text")
      .attr("y", -110)
      .attr("dx", -height)
      .attr("text-anchor", "start")
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
    .attr("dy", function(d) { return height - 50 })
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central") 
    .attr("class", "labelled")
    .text(function(d) { 
        let val = d[type];
        if(val.toString().includes('.')){
            const tmp = val.toString().split('.')
            val = tmp[0] + '.' + tmp[1].substring(0, 2)
        }
        return val;
    });
   

}

