function generateTree(array, id, level) {
    var results = new Array();
    array.forEach(function (person) {
        if (person.cargo.depende_de == id) {
            var children = generateTree(array, person.id, level + 1);
            results.push(createPerson(person, children, level));
        }
    });
    return results;
}

function addAll(from, to) {
    from.forEach(function (person) {
        to.push(createPerson(person, [], 1));
    });
    return to;
}

function createPerson(person, children, level) {
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
        return {
            name: fullName,
            rank: rank,
            photo: photo,
            gender: gender,
            children: children,
            size: level
        };
    } else {
        return {name: fullName, rank: rank, photo: photo, gender: gender, size: level};
    }
    return null;
}

function countPeople(tree) {
    if (!tree.children) {
        return 1;
    }
    return 1 + tree.children.map(countPeople).reduce(function (a, b) {
            return a + b
        });
}