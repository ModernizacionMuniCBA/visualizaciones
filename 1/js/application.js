var apiUrl = "https://gobiernoabierto.cordoba.gob.ar";

d3.json(apiUrl + "/api/funciones/?format=json&page_size=350", function (error, funcionarios) {
    if (error) throw error;

    var selectedradius = getParameterByName("radio");
    if(!selectedradius){
        radius = 720;
    } else {
        radius = selectedradius;
    }

    var results = generateTree(funcionarios.results, null, 0)[0];
    var directors = getSubordinates(funcionarios.results, results.data.cargo.id);
    var secretaries = directors.map(function(p){return p.cargo.oficina});
    var filterSecretary = getParameterByName("secretarias");
    if(filterSecretary){
        var filtered = results.children.filter(function(director){
            return director.office == filterSecretary;
        });
        if(filtered && filtered.length > 0){
            results = filtered[0];
        }
    }

    var cluster = d3.layout.cluster()
        .size([360, radius - 120]);

    var diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg = d3.select("#dendogram").append("svg")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");

    var nodes = cluster.nodes(results);

    var link = svg.selectAll("path.link")
        .data(cluster.links(nodes))
        .enter().append("path")
        .attr("class", "link")
        .attr("stroke", function(d){
            return d3.scale.category20().range()[secretaries.indexOf(d.target.office)];
        })
        .attr("d", diagonal);

    var node = svg.selectAll("g.node")
        .data(nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
        });

    var div = d3.select("#dendogram").append("div")
        .attr("class", "tooltip")
        .style("opacity", 1e-6)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    node.append("a")
        .attr("href", personLink)
        .append("circle")
        .attr("r", function (d) {
            return (20 - d.size) / 4;
        })
        .attr("stroke", function (d) {
            return (d.gender == "M") ? "DarkBlue" : "DeepPink";
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    node.append("a")
        .attr("href", personLink)
        .append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function (d) {
            return d.x < 180 ? "start" : "end";
        })
        .attr("transform", function (d) {
            return d.x < 180 ? "translate(15)" : "rotate(180)translate(-15)";
        })
        .text(function (d) {
            return d.name;
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    function mouseover() {
        div.transition()
            .duration(300)
            .style("opacity", 1);
    }

    function mousemove(d) {
        div
            .html("<div class='img-thumbnail'><img style='max-height:100px;max-width:150px' src='" + d.photo + "'/></div><br/>" +
                "<b>" + d.name + "</b><br/>" + d.rank + "<br/><br/><i>" + d.data.cargo.oficina+"</i>")
            .style("left", (d3.event.pageX ) + "px")
            .style("top", (d3.event.pageY) + "px");
    }

    function mouseout() {
        div.transition()
            .duration(300)
            .style("opacity", 1e-6);
    }

    function personLink(d){
        if(d.link){
            return apiUrl + d.link;
        }
        return "#";
    }

    d3.select(self.frameElement).style("height", radius * 2 + "px");

    loadFilters(secretaries, filterSecretary, selectedradius);

});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function loadFilters(secretaries, current, selectedradius) {
    var s = $("<select/>");
    $("<option />", {value: "Todos", text: "Todos"}).appendTo(s);
    secretaries.forEach(function(secretary){
        $("<option />", {value: secretary, text: secretary}).appendTo(s);
    });
    if(current){
        s.val(current);
    }
    s.change(function(){
        var secretary = $(this).val();
        var params = new Object();
        if(secretaries.indexOf(secretary)>=0){
            params.secretarias = secretary;
        }
        if(selectedradius){
            params.radio = selectedradius;
        }
        window.location.href = "?" + $.param(params);
    });
    s.appendTo("#filters");
}
