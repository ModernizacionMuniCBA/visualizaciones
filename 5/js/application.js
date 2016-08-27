var ageChart;
var secretaryChart;
var genderChart;
var rankChart;
var averageAge;
var totalEdad = 0;
var countEdad = 0;
var chartNameMap;

var apiUrl = "https://gobiernoabierto.cordoba.gob.ar";
loadJson(apiUrl + "/api/funciones/?format=json&page_size=350");

function loadJson(path) {
    secretaryChart = dc.rowChart('#secretary-chart');
    rankChart = dc.rowChart('#rank-chart');
    ageChart = dc.rowChart('#age-chart');
    genderChart = dc.pieChart("#gender-chart");
    peopleCount = dc.dataCount('.dc-data-count');
    peopleTable = dc.dataTable('.dc-data-table');
    averageAge = dc.numberDisplay('#average-age');
    chartNameMap = {
        "edad": ageChart,
        "secretaria": secretaryChart,
        "genero": genderChart,
        "cargo": rankChart
    };
    d3.json(path, function (error,data) {
        if(error){
            $("#content").html("Hubo un error al cargar los datos");
        } else {
            var dateFormat = d3.time.format('%Y-%m-%d');
            var numberFormat = d3.format('.2f');
            var topDir = 10;
            var totalWidth = 990;
            var height = 300;

            var maxYear = new Date().getFullYear();
            var minYear = maxYear;

            var people = data.results;
            people.map(function (d) {
                if (d.fecha_inicio) {
                    d.fechaIni = dateFormat.parse(d.fecha_inicio).getMonth() + 1;
                }
                if (!d.funcionario.franjaetaria) {
                    d.funcionario.franjaetaria = "Desconocido";
                }
                if (!d.funcionario.genero) {
                    d.funcionario.genero = "No especificado";
                }
                if (!d.funcionario.edad) {
                    d.funcionario.edad = null;
                }
                return d;
            });

            people = people.filter(function (person) {
                return (person.cargo.depende_de == null || person.cargo.superioresids.length != 0);
            });

            var root = getSubordinates(people, null)[0];
            root.secretary = "Intendencia";
            var directSubs = getSubordinates(people, root.cargo.id);
            directSubs.forEach(function (val) {
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

            var allDimension = peopleData.dimension(function (d) {
                return "";
            });

            var ageGroup = ageDimension.group().reduceCount();

            var genderGroup = genderDimension.group().reduceCount();

            var dateGroup = dateDimension.group().reduceCount();

            var rankGroup = rankDimension.group().reduceCount();

            var secretaryGroup = secretaryDimension.group().reduceCount();

            var average_age_group = allDimension.group().reduce(
                function reduceAdd(ka, v) {
                    if (v.funcionario.edad == null) {
                        return ka;
                    }
                    ++ka.count;
                    ka.total += v.funcionario.edad;
                    return ka;
                },

                function reduceRemove(ka, v) {
                    if (v.funcionario.edad == null) {
                        return ka;
                    }
                    --ka.count;
                    ka.total -= v.funcionario.edad;
                    return ka;
                },

                function reduceInitial() {
                    return {count: 0, total: 0};
                }
            );

            rankChart
                .width(totalWidth / 3)
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
                .width(totalWidth / 3)
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

            averageAge.group(average_age_group)
                .valueAccessor(function (p) {
                    if (p.value.count) {
                        return (p.value.total) / p.value.count;
                    } else {
                        return -1;
                    }
                })
                .formatNumber(function (d) {
                    if (d == -1) {
                        return "N/A";
                    }
                    return d.toFixed(1);
                });

            ageChart
                .width(totalWidth / 4)
                .height(300)
                .margins({top: 20, left: 10, right: 10, bottom: 20})
                .dimension(ageDimension)
                .ordinalColors(['#6baed6'])
                .renderLabel(true)
                .group(ageGroup)
                .elasticX(true)
                .xAxis().tickFormat(d3.format("d"));

            genderChart
                .width(totalWidth / 5)
                .height(300)
                .dimension(genderDimension)
                .ordinalColors(['#e377c2', "#1f77b4", "#DDD"])
                .renderLabel(true)
                .group(genderGroup);

            peopleCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
                .dimension(peopleData)
                .group(all)
                .html({
                    some: '<strong>%filter-count</strong> de <strong>%total-count</strong> ' +
                    ' | <a href=\'javascript:dc.filterAll(); history.pushState(null, null, "#[]"); dc.renderAll();\'\'>borrar todos los filtros</a>',
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
                            if (!d.funcionario.foto.thumbnail)
                                return "";
                            return "<img class='profile-picture' src='" + d.funcionario.foto.thumbnail + "'/>";
                        }
                    },
                    {
                        label: 'Funcionario',
                        format: function (d) {
                            return "<a href=" + apiUrl + d.funcionario.url + ">" + getText(d.funcionario) + "</a>";
                            function getText(func) {
                                return func.nombrepublico;
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
                            return d.cargo.oficina;
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

            dcFilterRememberer();

            dc.renderAll();
        }

        $("#content").show();
    });
}

function getSubordinates(array, id) {
    var results = new Array();
    array.forEach(function (person) {
        if (person.cargo.depende_de == id) {
            results.push(person);
        }
    });
    return results;
}

function generateFilterHandler(name) {
    return function (dimension, filter) {
        dimension.filter(filter);
        if(filter.length > 0){
            setJsonToUrl(name, JSON.stringify(filter));
        } else {

        }
        dc.renderAll();
        return filter;
    }
}

function loadSecretary(array, id, secretary) {
    array.forEach(function (person) {
        if ($.inArray(id, person.cargo.superioresids) != -1) {
            person.secretary = secretary;
        }
    });
}

function loadDefaultValues(people, rootId) {
    loadDefaultValue(people, "secretary", "Desconocido", rootId);
}

function loadDefaultValue(people, field, value, excludeId) {
    people.forEach(function (val) {
        if ((val[field] == undefined || val[field] == null) && val.id != excludeId) {
            val[field] = value;
        }
    });
}

function getChartByName(name) {
    return chartNameMap[name];
}

function getNameFromChart(chart) {
    for(var k in chartNameMap){
        if(chartNameMap[k] == chart){
            return k;
        }
    }
    return null;
}
