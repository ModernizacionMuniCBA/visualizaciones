$(function() {
  startSpinner("viz");
  funcionariosTask.then(viz).then(stopSpinner).catch(function (error) {
    throw error;
  });
});

function personLink(d){
  if(d.object.funcionario.url){
      return getApiUrl() + d.object.funcionario.url;
  }
  return "#";
}

function personPhoto(d) {
 if (d.object.funcionario.foto.thumbnail) {
  return d.object.funcionario.foto.thumbnail;
 } else if (d.object.funcionario.foto.original) {
  return d.object.funcionario.foto.original;
 } else {
  return null;
 }
}

function draw(root) {
  var margin = 20,
    diameter = 960;

  function mouseover() {
    tooltip.transition()
    .duration(300)
    .style("opacity", 1);
  }

  function mousemove(d) {
    if (!personPhoto(d)) {
      tooltip
        .html(
            "<h4>" + d.object.cargo.oficina + "</h4>" +
            "<h5>" + d.object.funcionario.nombrepublico + "</h5>" +
            "<i>" + d.object.cargo.categoria.nombre + "</i>");
    } else {
      tooltip
          .html(
              "<h4>" + d.object.cargo.oficina + "</h4>" +
              "<img src='" + personPhoto(d) + "'/>" +
              "<h5>" + d.object.funcionario.nombrepublico + "</h5>" +
              "<i>" + d.object.cargo.categoria.nombre + "</i>");
    }
    tooltip
      .style("left", (d3.event.pageX ) + "px")
      .style("top", (d3.event.pageY) + "px");
  }

  function mouseout() {
    tooltip.transition()
      .duration(300)
      .style("opacity", 0);
  }

  var saturationDepthPink = d3.scale.linear()
      .domain([1, depth])
      .range([60, 85]);

  var saturationDepthBlue = d3.scale.linear()
      .domain([1, depth])
      .range([50, 80]);

  var saturationDepthGray = d3.scale.linear()
      .domain([1, depth])
      .range([72, 100]);

  var pack = d3.layout.pack()
      .padding(2)
      .size([diameter - margin, diameter - margin])
      .value(function(d) { return d.size; });

  var svg = d3.select("#viz").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

  d3.select("body")
    .style("background", '#FFF')
    .on("click", function() { zoom(root); });

  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip');

  var focus = root,
      nodes = pack.nodes(root),
        view;

  function genderColor(d) {
    if (d.object.funcionario.genero == 'F') {
      // hsla(343, 100%, 58%, 1)
      return 'hsl(343, 100%,' + saturationDepthPink(d.depth) + '%)';
    } else if (d.object.funcionario.genero == 'M') {
      // hsla(199, 85%, 65%, 1)
      return 'hsl(199, 85%,' + saturationDepthBlue(d.depth) + '%)';
    } else {
      // hsla(0, 0%, 87%, 1)
      return 'hsl(0, 0%, '+ saturationDepthGray(d.depth) + '%)';
    }
  }
 
  var circle = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    .style("fill", genderColor)
    .on("click", function(d) {
      if (focus !== d) {
        zoom(d);
        d3.event.stopPropagation();
      }
    })
    .on("mouseover", function(d) { mouseover(); d3.event.stopPropagation();})
    .on("mousemove", function(d) { mousemove(d); d3.event.stopPropagation();})
    .on("mouseout", function(d) { mouseout(); d3.event.stopPropagation();});

  var text = svg.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("class", "label")
    .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
    .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
    .on("click", function(d) { window.open(personLink(d)); })
    .text(function(d) { return d.name; });

  var node = svg.selectAll("circle,text");

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }

d3.select(self.frameElement).style("height", diameter + "px");
}