const http = require("http/rs");

const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoImg = require("codbex-petstore/gen/dao/Entities/photoUrl.js");
const daoTag = require("codbex-petstore/gen/dao/Entities/tag.js");

const petCategories = [
    'Dog', 'Cat', 'Parakeet', 'Canary', 'Fish', 'Hamster', 'Guinea Pig', 'Rabbit', 'Snake',
    'Turtle', 'Lizard', 'Gecko', 'Ferret', 'Mouse', 'Rat', 'Hedgehog', 'Gerbil', 'Chinchilla',
    'Tarantula', 'Hermit Crab'
];

const petStatus = ['available', 'pending', 'sold'];

const isValidUrl = (urlString) => {
    var urlPattern = new RegExp(
        '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i' // validate fragment locator
    );

    return !!urlPattern.test(urlString);
};

http.service({
    "pet/:petId/uploadImage": {
        "post": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();

                body.id = request.params.petId;

                ["id", "imageUrl"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        return;
                    }
                });

                if (!daoPet.get(body.id)) {
                    response.setStatus(404);
                    return;
                }

                if (!isValidUrl(body.imageUrl)) {
                    response.setStatus(400);
                    return;
                }

                daoImg.create(body.id, body.imageUrl);
                response.setStatus(200);
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    "pet": {
        "post": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();

                ["name", "category", "status", "imageUrl", "tags"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        return;
                    }
                });

                body.petCategoryId = petCategories.indexOf(body.category);
                if (body.petCategoryId == -1) {
                    response.println("Invalid Category");
                    response.setStatus(400);
                    return;
                }

                body.petstatusid = petStatus.indexOf(body.status); //TODO petSStatus
                if (body.petstatusid == -1) {
                    response.println("Invalid status");
                    response.setStatus(400);
                    return;
                }

                const newPet = daoPet.get(daoPet.create(body));

                if (!newPet) {
                    response.println("Could not create the pet");
                    response.setStatus(500);
                    return;
                }

                try {
                    body.imageUrl.forEach((url) => {
                        if (!isValidUrl(url)) {
                            response.println("Invalid Url");
                            response.setStatus(400);
                            return;
                        } else {
                            daoImg.create(newPet.id, url);
                        }
                    });
                } catch (e) {
                    if (!isValidUrl(body.imageUrl)) {
                        response.println("Invalid Url\n" + e);
                        response.setStatus(400);
                        return;
                    } else {
                        daoImg.create(newPet.id, body.imageUrl);
                    }
                }

                try {
                    body.tags.forEach((tag) => {
                        daoTag.create(newPet.id, tag);
                    });
                } catch {
                    daoTag.create(newPet.id, body.tags);
                }

                response.setStatus(201)
                response.println(JSON.stringify(newPet));
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }],
        "put": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();
                ["id", "name", "category", "status", "imageUrl", "tags"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        response.println("U");
                        return;
                    }
                });

                if (!petCategories.includes(body.category)) {
                    response.setStatus(400);
                    response.println("Invalid category");
                    return;
                }

                if (!petStatus.includes(body.status)) {
                    response.setStatus(400);
                    response.println("Invalid status");
                    return;
                }

                urlList = daoImg.list();

                urlList.forEach((url) => {
                    if (url.petid === body.id) {
                        daoImg.delete(url.id);
                    }
                });

                tagList = daoTag.list();

                tagList.forEach((tag) => {
                    if (tag.petid === body.id) {
                        daoImg.delete(tag.id);
                    }
                });

                if (!daoPet.get(body.id)) {
                    response.setStatus(404);
                    response.println("Pet not found");
                    return;
                }

                daoPet.update(body);

                body.imageUrl.forEach((url) => {
                    if (!isValidUrl(url)) {
                        response.setStatus(400);
                        response.println("Invalid image url");
                        return;
                    } else {
                        daoImg.create(updatedPet.id, url);
                    }
                });

                body.tags.forEach((tag) => {
                    daoTag.create(updatedPet.id, tag);
                });

                response.setStatus(200);
                response.println(JSON.stringify(updatedPet));
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    "pet/findByStatus": {
        "get": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();
                if (!body.status) {
                    response.setStatus(400);
                    return;
                }

                if (!petStatus.includes(body.status)) {
                    response.setStatus(400);
                    return;
                }

                const status = body.status;

                const allPets = daoPet.list();

                const petsWithStatus = allPets.filter(pet => pet.status === status);

                response.println(JSON.stringify(petsWithStatus));
                response.setStatus(200);
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    "pet/:petid": {
        "get": [{
            "serve": (_ctx, request, response) => {
                const pet = daoPet.get(request.params.petid);

                if (!pet) {
                    response.setStatus(404);
                    response.println("Pet not found!")
                    return;
                }
                response.setStatus(200);
                response.println(JSON.stringify(pet));
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }],
        "post": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();
                body.id = request.params.petid;

                ["name", "status"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        response.println("U");
                        return;
                    }
                });

                if (!petStatus.includes(body.status)) {
                    response.setStatus(400);
                    response.println("Invalid status");
                    return;
                }

                if (daoPet.get(body.id)) {
                    response.setStatus(404);
                    response.println("Pet not found");
                    return;
                }

                daoPet.update(body);

                response.setStatus(200)
                response.println(JSON.stringify(updatedPet));

            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }],
        "delete": [{
            "serve": (_ctx, request, response) => {
                const id = request.params.petid;
                if (!id) {
                    response.setStatus(404);
                    response.println("Id not found");
                    return;
                }

                daoPet.delete(id);

                if (daoPet.get(id)) {
                    response.setStatus(404);
                    response.println("Pet not found");
                    return;
                }

                response.setStatus(204);
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    }
}).execute();