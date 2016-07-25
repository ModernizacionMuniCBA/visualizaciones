var clerk;
var data;
var count;

$( document ).ready(function() {

  d3.json("data/page.json", function(error, json) {
  	clerk = json.results;

  	var firstElem = _.find(clerk, function(o) { return o.cargo['depende_de'] == null; });
  	data = {
  		'name': firstElem.funcionario.nombre + ' ' + firstElem.funcionario.apellido,
  		'object': firstElem,
  		'children': []
  	};
  	count = 1;
  	searchDependencies(firstElem.id, data);
  	//console.log(data);
  	// console.log(count);
  	draw(data);
  });
});

function searchDependencies(id, root) {
	const dependencies = _.filter(clerk, function(o) { return o.cargo['depende_de'] == id; });
	$.each(dependencies, function(indexDepency, dependency) {
		count++;
		root.children.push({
  		'name': dependency.funcionario.nombre + ' ' + dependency.funcionario.apellido,
  		'object': dependency,
  		'size': 20,
  		'children': []
		})
		searchDependencies(dependency.id, root.children[indexDepency]);
	});
}