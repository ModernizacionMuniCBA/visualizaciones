//Spinner
var spinner;

function startSpinner(elementId) {
    var opts = {
        lines: 9, // The number of lines to draw
        length: 9, // The length of each line
        width: 5, // The line thickness
        radius: 14, // The radius of the inner circle
        color: '#EE3124', // #rgb or #rrggbb or array of colors
        speed: 1.9, // Rounds per second
        trail: 40, // Afterglow percentage
        className: 'spinner' // The CSS class to assign to the spinner
    };
    var target = document.getElementById(elementId);
    spinner = new Spinner(opts).spin(target);
}

function stopSpinner() {
    spinner.stop();
}
