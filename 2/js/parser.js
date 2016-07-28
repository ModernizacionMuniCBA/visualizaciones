var clerk;
var data;
var count;
var depth;

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
  	depth = 1;
  	searchDependencies(firstElem.id, data, depth);
  	console.log(data);
  	// console.log(count);
  	// console.log(depth);
  	draw(data);
  });
});

function searchDependencies(id, root, depthItem) {
	const dependencies = _.filter(clerk, function(o) { return o.cargo['depende_de'] == id; });
	if (dependencies.length > 0) {
		depth = Math.max(depth, depthItem);
	}
	$.each(dependencies, function(indexDepency, dependency) {
		count++;
		root.children.push({
  		'name': dependency.funcionario.nombre + ' ' + dependency.funcionario.apellido,
  		'object': dependency,
  		'size': 1,
  		'children': []
		})
		searchDependencies(dependency.id, root.children[indexDepency], depthItem + 1);
	});
}