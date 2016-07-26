function generateTree(array, id, level) {
    var results = new Array();
    array.forEach(function (person) {
        if (person.cargo.depende_de == id) {
//                console.log(person.id);
            var children = generateTree(array, person.id, level + 1);
            var fullName = person.funcionario.nombre + " " + person.funcionario.apellido;
            var rank = person.cargo.categoria.nombre;
            var photo = person.funcionario.foto.thumbnail;
            if (photo === undefined || photo == null) {
                photo = "http://plumtri.org/sites/all/themes/plumtritheme/images/default_profile.jpg";
            }
            var gender = person.funcionario.genero;
            if (gender == null || gender === undefined) {
                gender = Math.random() < 0.5 ? "Masculino" : "Femenino";
            }
            if (children.length != 0) {
                results.push({
                    name: fullName,
                    rank: rank,
                    photo: photo,
                    gender: gender,
                    children: children,
                    size: level
                });
            } else {
                results.push({name: fullName, rank: rank, photo: photo, gender: gender, size: level});
            }
        }
    });
    return results;
}

function countPeople(tree) {
    if (tree.children === undefined) {
        return 1;
    }
    return 1 + tree.children.map(countPeople).reduce(function (a, b) {
            return a + b
        });
}