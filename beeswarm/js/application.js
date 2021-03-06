$(function() {
    startSpinner("viz");
    funcionariosTask.then(beeswarmVis).then(stopSpinner).catch(function (error) {
        throw error;
    });
});

function beeswarmVis(jsonData) {
    var svg = d3.select("svg"),
        margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = svg.attr("width") - margin.left - margin.right,
        height = svg.attr("height") - margin.top - margin.bottom;

    var formatValue = d3.format(",d");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var datos;
    var dni;

    datos = jsonData.results;
    datos.forEach(function(d) {
        if (d.funcionario.edad == null) {
            dni = parseInt(d.funcionario.uniqueid.replace("DNI (AR) ",""));
            if (dni > 0) {
                d.funcionario.edad = (-0.000001508 * dni) + 77.779;
            }
        }
    });

    datos = _.filter(datos, function(o) { return (o.funcionario.edad !== null); });
    x.domain(d3.extent(datos, function(d) { return d.funcionario.edad; }));

    var simulation = d3.forceSimulation(datos)
        .force("x", d3.forceX(function(d) { return x(d.funcionario.edad); }).strength(1))
        .force("y", d3.forceY(height/2))
        .force("collide", d3.forceCollide(6))
        .stop();

    for (var i = 0; i < 100; ++i) simulation.tick();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(4, ".0s"));

    var cell = g.append("g")
        .attr("class", "cells")
        .selectAll("g").data(d3.voronoi()
            .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .polygons(datos)).enter().append("g");

    cell.append("a")
        .attr("class","link")
        .attr("xlink:href",function(d) { return getApiUrl() + d.data.funcionario.url; })
        .attr("target","_blank")
        .append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return d.data.x; })
        .attr("cy", function(d) { return d.data.y; })
        .attr("fill", function(d) {  if (d.data.funcionario.genero == 'M') { return "midnightblue" } else { return "hotpink" }  });

    cell.append("path")
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

    cell.append("title").text(function(d) { return d.data.funcionario.nombrepublico + "\n" + d.data.cargo.categoria.nombre + "\n" + d.data.cargo.nombre; });
}