(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.dcFilterRememberer = factory());
}(this, function () { 'use strict';

	function filterRememberer () {
	  var functions = this;
	  var firstRender = true;
	  var originalDcRenderAll = dc.renderAll;
	  dc.renderAll = function(g) {
	    if (firstRender) {
	      var query_string = window.location.hash.substring(1);
	      if (query_string.length > 0) {
	          console.log(JSON.parse(decodeURI(query_string)));
	        functions.applyFilters(JSON.parse(decodeURI(query_string)));
	      };
	    }
	    originalDcRenderAll(g);
	  }
	  window.onpopstate = function(event) {
	    var query_string = window.location.hash.substring(1);
	    dc.filterAll();
	    if (query_string.length > 0) {
	      functions.applyFilters(query_string);
	    }
	    dc.redrawAll();
	  };
	  dc.renderlet(function() {
	    var query_string = JSON.stringify(functions.getFilters());
	    if (window.location.hash.substring(1) != query_string) {
	      if (history.pushState) {
	        history.pushState(null, null, '#' + query_string);
	      } else {
	        location.hash = query_string;
	      }
	    }
	  })
	}

	function getFilters() {
	  return dc.chartRegistry.list().map(function(chart) {
	    return {
	      filtro: getNameFromChart(chart),
	      valores: chart.filters()
	    };
	  }).filter(function(o) {
	    return o.valores.length > 0;
	  });
	}

	function applyFilters(filters) {
	  var charts = dc.chartRegistry.list();
	  filters.forEach(function(object) {
	    var chart = getChartByName(object.filtro);
	    object.valores.forEach(function(filter) {
	      if (Array.isArray(filter) && filter.length == 2) {
	        chart.filter(dc.filters.RangedTwoDimensionalFilter.call(this, filter));
	      } else {
	        chart.filter(filter);
	      }
	    });
	  });
	}

	var version = "1.0.0";

	var functions = {
	    getFilters: getFilters,
	    applyFilters: applyFilters
	  };
	var dcFilterRememberer = filterRememberer.bind(functions);
	dcFilterRememberer.version = version;
	Object.keys(functions).forEach(function(key) {
	  dcFilterRememberer[key] = function(_) {
	    if (!arguments.length) return functions[key];
	    else if (typeof(_) === "function") functions[key] = _;
	    else throw "[dcFilterRememberer] Unexpected input in getter/setter function";
	    return dcFilterRememberer;
	  };
	});

	return dcFilterRememberer;

}));