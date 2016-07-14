// var monthCountChart;
var ageChart;
var secretaryChart;

loadJson("page.json");

function loadJson(path) {
    secretaryChart = dc.rowChart('#secretary-chart');
    ageChart = dc.rowChart('#age-chart');
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
                d.funcionario.franjaetaria = "Nulo";
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

        var ageGroup = ageDimension.group().reduceCount();

        var dateGroup = dateDimension.group().reduceCount();

        var secretaryGroup = secretaryDimension.group().reduceCount();


        secretaryChart
            .width(totalWidth)
            .height(400)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(secretaryDimension)
            .ordinalColors(d3.scale.category10().range())
            .renderLabel(true)
            .group(secretaryGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

        ageChart
            .width(totalWidth)
            .height(200)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .dimension(ageDimension)
            .ordinalColors(d3.scale.category10().range())
            .renderLabel(true)
            .group(ageGroup)
            .elasticX(true)
            .xAxis().tickFormat(d3.format("d"));

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
