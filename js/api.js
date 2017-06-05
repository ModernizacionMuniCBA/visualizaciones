var funcionariosUrl = "//gobiernoabierto.cordoba.gob.ar";

var funcionariosTask = new Promise(function (resolve, reject) {
    var today = new Date().toLocaleDateString();

    if (localStorage.funcionariosData == null || localStorage.funcionariosData == "null" || localStorage.funcionariosData == "undefined" || localStorage.userDate != today ) {
        d3.json(funcionariosUrl + "/api/funciones/?format=json&page_size=350", function (error, funcionarios) {
            if (error) reject(error);
            resolve(funcionarios);
            localStorage.funcionariosData = JSON.stringify(funcionarios);
        });
    } else {
        resolve(JSON.parse(localStorage.funcionariosData));
    }
    localStorage.userDate = today;
});

function getApiUrl() {
    return funcionariosUrl;
}
