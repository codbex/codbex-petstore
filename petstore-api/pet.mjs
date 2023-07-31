import { rs } from "@dirigible/http"

const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoImg = require("codbex-petstore/gen/dao/entities/photoUrl.js");
const daoTag = require("codbex-petstore/gen/dao/entities/tag.js");
const daoPetStatus = require("codbex-petstore/gen/dao/entities/petStatus.js");
const daoPetCategory = require("codbex-petstore/gen/dao/entities/petCategory.js");

const categoryList = daoPetCategory.list();
const petCategory = [];
categoryList.forEach(elem => { petCategory.push(elem.name) });

const statusList = daoPetStatus.list();
const petStatus = [];
statusList.forEach(elem => { petStatus.push(elem.name) });

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

rs.service({
    "pet/:petId/uploadImage": {
        "post": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();

                body.id = request.params.petId;

                ["id", "imageUrl"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        response.println("Required more parameters");
                        return;
                    }
                });

                if (!daoPet.get(body.id)) {
                    response.setStatus(404);
                    response.println("Pet not found!");
                    return;
                }

                if (!isValidUrl(body.imageUrl)) {
                    response.setStatus(400);
                    response.println("Invalid ImageUrl!");
                    return;
                }

                const newImg = daoImg.create({ Petid: body.id, url: body.imageUrl });

                if (!daoImg.get(newImg)) {
                    response.println("Failed image creation!");
                    response.setStatus(400);
                }
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

                body.petCategoryid = petCategory.indexOf(body.category);

                if (body.petCategoryid == -1) {
                    response.println("Invalid Category");
                    response.setStatus(400);
                    return;
                }

                body.petStatusid = petStatus.indexOf(body.status);

                if (body.petStatusid == -1) {
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
                            daoImg.create({ Petid: newPet.id, url: url });
                        }
                    });
                } catch (e) {
                    if (!isValidUrl(body.imageUrl)) {
                        response.println("Invalid Url\n" + e);
                        response.setStatus(400);
                        return;
                    } else {
                        daoImg.create({ Petid: newPet.id, url: body.imageUrl });
                    }
                }

                try {
                    body.tags.forEach((tag) => {
                        daoTag.create({ Petid: newPet.id, tag: tag });
                    });
                } catch {
                    daoTag.create({ Petid: newPet.id, tag: body.tags });
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

                body.petCategoryid = petCategory.indexOf(body.category);

                if (body.petCategoryid == -1) {
                    response.println("Invalid Category");
                    response.setStatus(400);
                    return;
                }

                body.petStatusid = petStatus.indexOf(body.status);

                if (body.petStatusid == -1) {
                    response.println("Invalid status");
                    response.setStatus(400);
                    return;
                }

                const urlList = daoImg.list();

                urlList.forEach((url) => {
                    if (url.petid === body.id) {
                        daoImg.delete(url.id);
                    }
                });

                const tagList = daoTag.list();

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

                try {
                    body.imageUrl.forEach((url) => {
                        if (!isValidUrl(url)) {
                            response.println("Invalid Url");
                            response.setStatus(400);
                            return;
                        } else {
                            daoImg.create(body.id, url);
                        }
                    });
                } catch (e) {
                    if (!isValidUrl(body.imageUrl)) {
                        response.println("Invalid Url\n" + e);
                        response.setStatus(400);
                        return;
                    } else {
                        daoImg.create(body.id, body.imageUrl);
                    }
                }

                try {
                    body.tags.forEach((tag) => {
                        daoTag.create(body.id, tag);
                    });
                } catch {
                    daoTag.create(body.id, body.tags);
                }

                response.setStatus(200);
                response.println(JSON.stringify(daoPet.get(body.id)));
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
                    response.println("Status required!");
                    return;
                }

                if (!petStatus.includes(body.status)) {
                    response.setStatus(400);
                    response.println("Invalid status!");
                    return;
                }

                const status = body.status;

                const allPets = daoPet.list();

                const statusPets = [];

                allPets.forEach((pet) => {
                    if (petStatus[pet.petStatusid] === status) {
                        statusPets.push(pet);
                    }
                });

                response.println(JSON.stringify(statusPets));
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

                body.petStatusid = petStatus.indexOf(body.status);

                if (body.petStatusid == -1) {
                    response.println("Invalid status");
                    response.setStatus(400);
                    return;
                }

                if (!daoPet.get(body.id)) {
                    response.setStatus(404);
                    response.println("Pet not found");
                    return;
                }

                daoPet.update(body);

                response.setStatus(200)
                response.println(JSON.stringify(daoPet.get(body.id)));

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