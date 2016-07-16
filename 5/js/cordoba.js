// var monthCountChart;
var ageChart;
var secretaryChart;
var genderChart;

loadJson("page.json");

function loadJson(path) {
    secretaryChart = dc.rowChart('#secretary-chart');
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
                d.funcionario.genero = (Math.random() < 0.7) ? "Masculino" : "Femenino";
            }
            return d;
        });

        console.log(people);

        var peopleData = crossfilter(people);
        var all = peopleData.groupAll();

        var ageDimension = peopleData.dimension(function (d) {
            return d.funcionario.franjaetaria;
        });

        var dateDimension = peopleData.dimension(function (d) {
            return d.fechaIni;
        });

        var secretaryDimension = peopleData.dimension(function (d) {
            return d.cargo.categoria.nombre;
        });

        var genderDimension = peopleData.dimension(function (d) {
            return d.funcionario.genero;
        });

        var ageGroup = ageDimension.group().reduceCount();

        var genderGroup = genderDimension.group().reduceCount();

        var dateGroup = dateDimension.group().reduceCount();

        var secretaryGroup = secretaryDimension.group().reduceCount();


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
            .width(totalWidth/3.5)
            .height(300)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(ageDimension)
            .renderLabel(true)
            .group(ageGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

        genderChart
            .width(totalWidth/4)
            .height(300)
            .dimension(genderDimension)
            .renderLabel(true)
            .group(genderGroup);

        peopleCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
            .dimension(peopleData)
            .group(all)
            .html({
                some: '<strong>%filter-count</strong> de <strong>%total-count</strong> ' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>limpiar la selección</a>',
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
                    // Specify a custom format for column 'Change' by using a label with a function.
                    label: 'Foto',
                    format: function (d) {
                        if(d.funcionario.foto.thumbnail == null || d.funcionario.foto.thumbnail === undefined)
                            return "";
                        return "<img style='max-height:50px' src='" + d.funcionario.foto.thumbnail + "'/>";
                    }
                },
                {
                    // Specify a custom format for column 'Change' by using a label with a function.
                    label: 'Funcionario',
                    format: function (d) {
                        return d.funcionario.nombre + " " + d.funcionario.apellido;
                    }
                },
                'fecha_inicio'
            ])
            .order(d3.ascending)
            .on('renderlet', function (table) {
                table.selectAll('.dc-table-group').classed('info', true);
            });

        dc.renderAll();


    });
}
