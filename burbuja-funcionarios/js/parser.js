var clerk;
var data;
var count;
var depth;

function viz(jsonData) {
	clerk = jsonData.results;
  	var firstElem = _.find(clerk, function(o) { return o.cargo['depende_de'] == null; });
    var name = firstElem.nombrepublico;
    if (name == undefined) {
      name = firstElem.funcionario.nombre + ' ' + firstElem.funcionario.apellido;
    }
  	data = {
  		'name': name,
  		'object': firstElem,
  		'children': []
  	};
  	count = 1;
  	depth = 1;
  	searchDependencies(firstElem.cargo.id, data, depth);
  	draw(data);
}

function searchDependencies(positionId, root, depthItem) {
	const dependencies = _.filter(clerk, function(o) { return o.cargo['depende_de'] == positionId; });
	if (dependencies.length > 0) {
		depth = Math.max(depth, depthItem);
	}
	$.each(dependencies, function(indexDepency, dependency) {
		count++;
    var name = dependency.cargo.oficina;

		root.children.push({
  		// 'name': dependency.funcionario.nombre + ' ' + dependency.funcionario.apellido,
		'name': name,
		'object': dependency,
  		'size': 1,
  		'children': []
		});
		searchDependencies(dependency.cargo.id, root.children[indexDepency], depthItem + 1);
	});
}
