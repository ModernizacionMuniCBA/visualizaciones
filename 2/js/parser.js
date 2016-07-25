$( document ).ready(function() {

  d3.json("data/page.json", function(error, json) {
  	const funcionarios = json.results;
  	console.log(funcionarios);
  	$.each(funcionarios, function(indexFuncionario, funcionario) {
  		console.log(funcionario);
  	});
  		
  });

});