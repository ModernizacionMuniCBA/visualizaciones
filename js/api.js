var funcionariosUrl = "//gobiernoabierto.cordoba.gob.ar";

var funcionariosTask = new Promise(function (resolve, reject) {
    if (localStorage.funcionariosData == null || localStorage.funcionariosData == "null" || localStorage.funcionariosData == "undefined") {
        d3.json(funcionariosUrl + "/api/funciones/?format=json&page_size=350", function (error, funcionarios) {
            if (error) reject(error);
            resolve(funcionarios);
            localStorage.funcionariosData = JSON.stringify(funcionarios);
        });
    } else {
        resolve(JSON.parse(localStorage.funcionariosData));
    }
});

function getApiUrl() {
    return funcionariosUrl;
}