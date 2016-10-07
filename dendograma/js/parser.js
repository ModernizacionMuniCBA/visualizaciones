function generateTree(array, id, level, office) {
    return _.map(getSubordinates(array, id), function (person) {
            var myOffice;
            if(office || level == 0){
                myOffice = office;
            } else {
                myOffice = person.cargo.oficina;
            }
            var children = generateTree(array, person.cargo.id, level + 1, myOffice);
            var person = createPerson(person, children, level);
            person.office = myOffice;
            return person;
        }
    );
}

function createPerson(person, children, level) {
    var fullName = person.funcionario.nombrepublico;
    var rank = person.cargo.categoria.nombre;
    var photo = person.funcionario.foto.thumbnail;
    if (photo === undefined || photo == null) {
        photo = "images/default_profile.jpg";
    }
    var gender = person.funcionario.genero;
    if (gender == null || gender === undefined) {
        gender = null;
    }
    var link = person.funcionario.url;
    if (children.length != 0) {
        return {
            name: fullName,
            rank: rank,
            photo: photo,
            gender: gender,
            children: children,
            size: level,
            link: link,
            data: person
        };
    } else {
        return {name: fullName, rank: rank, photo: photo, gender: gender, size: level, link: link, data: person};
    }
    return null;
}

function getSubordinates(array, id) {
    return _.filter(array, function(person) {
        return person.cargo.depende_de == id;
    });
}
