var ageChart;
var secretaryChart;
var genderChart;
var rankChart;

var apiUrl = "http://gobiernoabierto.cordoba.gov.ar";
loadJson("page.json");

function loadJson(path) {
    secretaryChart = dc.rowChart('#secretary-chart');
    rankChart = dc.rowChart('#rank-chart');
    ageChart = dc.rowChart('#age-chart');
    genderChart = dc.pieChart("#gender-chart");
    peopleCount = dc.dataCount('.dc-data-count');
    peopleTable = dc.dataTable('.dc-data-table');
    d3.json(path, function (data) {
        var dateFormat = d3.time.format('%Y-%m-%d');
        var numberFormat = d3.format('.2f');
        var topDir = 10;
        var totalWidth = 990;
        var height = 300;

        var maxYear = new Date().getFullYear();
        var minYear = maxYear;

        var people = data.results;
        people.map(function (d) {
            if(d.fecha_inicio != null) {
                d.fechaIni = dateFormat.parse(d.fecha_inicio).getMonth() + 1;
            }
            if(d.funcionario.franjaetaria == null){
                d.funcionario.franjaetaria = "Desconocido";
            }
            if(d.funcionario.genero == null || d.funcionario.genero == ""){
                d.funcionario.genero = "No especificado";
            }
            return d;
        });

        people = people.filter(function(person){
           return (person.cargo.depende_de == null || person.cargo.superioresids.length != 0);
        });

        var root = getSubordinates(people, null)[0];
        root.secretary = "Intendencia";
        var directSubs = getSubordinates(people, root.cargo.id);
        directSubs.forEach(function(val){
            val.secretary = val.cargo.oficina;
            loadSecretary(people, val.cargo.id, val.secretary);
        });

        loadDefaultValues(people, root.id);


        var peopleData = crossfilter(people);
        var all = peopleData.groupAll();

        var ageDimension = peopleData.dimension(function (d) {
            return d.funcionario.franjaetaria;
        });

        var dateDimension = peopleData.dimension(function (d) {
            return d.fechaIni;
        });

        var rankDimension = peopleData.dimension(function (d) {
            return d.cargo.categoria.nombre;
        });

        var secretaryDimension = peopleData.dimension(function (d) {
            return d.secretary;
        });


        var genderDimension = peopleData.dimension(function (d) {
            return d.funcionario.genero;
        });

        var ageGroup = ageDimension.group().reduceCount();

        var genderGroup = genderDimension.group().reduceCount();

        var dateGroup = dateDimension.group().reduceCount();

        var rankGroup = rankDimension.group().reduceCount();

        var secretaryGroup = secretaryDimension.group().reduceCount();


        rankChart
            .width(totalWidth/3)
            .height(300)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(rankDimension)
            .ordinalColors(["#6baed6"])
            .renderLabel(true)
            .legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))
            .gap([1])
            .group(rankGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

        secretaryChart
            .width(totalWidth/3)
            .height(300)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(secretaryDimension)
            .ordinalColors(["#6baed6"])
            .renderLabel(true)
            .legend(dc.legend().x(400).y(10).itemHeight(13).gap(5))
            .gap([1])
            .group(secretaryGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

        ageChart
            .width(totalWidth/4)
            .height(300)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(ageDimension)
            .ordinalColors(['#6baed6'])
            .renderLabel(true)
            .group(ageGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

        genderChart
            .width(totalWidth/5)
            .height(300)
            .dimension(genderDimension)
            .ordinalColors(['#e377c2',"#1f77b4", "#DDD"])
            .renderLabel(true)
            .group(genderGroup);

        peopleCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
            .dimension(peopleData)
            .group(all)
            .html({
                some: '<strong>%filter-count</strong> de <strong>%total-count</strong> ' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>borrar todos los filtros</a>',
                all: 'Todos los funcionarios están seleccionados.'
            });

        peopleTable
            .dimension(ageDimension)
            .group(function (d) {
                return d.funcionario.franjaetaria;
            })
            .size(400)
            .columns([
                {
                    label: 'Foto',
                    format: function (d) {
                        if(!d.funcionario.foto.thumbnail)
                            return "";
                        return "<img style='max-height:50px' src='" + d.funcionario.foto.thumbnail + "'/>";
                    }
                },
                {
                    label: 'Funcionario',
                    format: function (d) {
                        return "<a href="+apiUrl+d.funcionario.url+">"+getText(d.funcionario) + "</a>";
                        function getText(func){
                            if(func.nombrepublico){
                                return func.nombrepublico;
                            }
                            return func.nombre + " " + func.apellido;
                        }
                    }
                },
                {
                    label: 'Edad',
                    format: function (d) {
                        return d.funcionario.edad;
                    }
                },
                {
                    label: 'Cargo',
                    format: function (d) {
                        return d.cargo.categoria.nombre;
                    }
                },
                {
                    label: 'Oficina',
                    format: function (d) {
                        return d.cargo.oficina ;
                    }
                }
            ])
            .order(d3.ascending)
            .sortBy(function (d) {
                return d.funcionario.edad;
            })
            .on('renderlet', function (table) {
                table.selectAll('.dc-table-group').classed('info', true);
            });

        dc.renderAll();


    });
}

function getSubordinates(array, id){
    var results = new Array();
    array.forEach(function(person){
        if(person.cargo.depende_de == id){
            results.push(person);
        }
    });
    return results;
}

function loadSecretary(array, id, secretary){
    array.forEach(function(person){
        if($.inArray(id, person.cargo.superioresids) != -1){
            person.secretary = secretary;
        }
    });
}

function loadDefaultValues(people, rootId){
    loadDefaultValue(people, "secretary", "Desconocido", rootId);
}

function loadDefaultValue(people, field, value, excludeId){
    people.forEach(function(val){
        if((val[field] == undefined || val[field] == null) && val.id != excludeId){
            val[field] = value;
        }
    });
}
