var radius = 960 / 2;

var cluster = d3.layout.cluster()
    .size([360, radius - 120]);

var diagonal = d3.svg.diagonal.radial()
    .projection(function (d) {
        return [d.y, d.x / 180 * Math.PI];
    });

var svg = d3.select("body").append("svg")
    .attr("width", radius * 2)
    .attr("height", radius * 2)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

d3.json("data/page.json", function (error, funcionarios) {
    if (error) throw error;
    var results = generateTree(funcionarios.results, null, 0)[0];
    results.children = addAll(funcionarios.results, results.children);
    var nodes = cluster.nodes(results);

    var link = svg.selectAll("path.link")
        .data(cluster.links(nodes))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", diagonal);

    var node = svg.selectAll("g.node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        });

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 1e-6);

    node.append("circle")
        .attr("r", function (d) {
            return (20 - d.size) / 4;
        })
        .attr("stroke", function (d) {
            return (d.gender == "Masculino") ? "DarkBlue" : "DeepPink";
        })
        .on("mouseover", mouseover)
        .on("mousemove", function (d) {
            mousemove(d);
        })
        .on("mouseout", mouseout);

    node.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function (d) {
            return d.x < 180 ? "start" : "end";
        })
        .attr("transform", function (d) {
            return d.x < 180 ? "translate(15)" : "rotate(180)translate(-15)";
        })
        .text(function (d) {
            return d.name;
        });

    function mouseover() {
        div.transition()
            .duration(300)
            .style("opacity", 1);
    }

    function mousemove(d) {
        div
            .html("<img style='max-height:100px;max-width:150px' src='" + d.photo + "'/><br/>" +
                "Nombre: " + d.name + "<br/>" +
                "Cargo: " + d.rank)
            .style("left", (d3.event.pageX ) + "px")
            .style("top", (d3.event.pageY) + "px");
    }

    function mouseout() {
        div.transition()
            .duration(300)
            .style("opacity", 1e-6);
    }
});

d3.select(self.frameElement).style("height", radius * 2 + "px");