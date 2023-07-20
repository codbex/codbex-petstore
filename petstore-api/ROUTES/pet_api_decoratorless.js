const http = require("http/rs");

const petCategories = [
  'Dog',
  'Cat',
  'Parakeet',
  'Canary',
  'Fish',
  'Hamster',
  'Guinea Pig',
  'Rabbit',
  'Snake',
  'Turtle',
  'Lizard',
  'Gecko',
  'Ferret',
  'Mouse',
  'Rat',
  'Hedgehog',
  'Gerbil',
  'Chinchilla',
  'Tarantula',
  'Hermit Crab'
];

const petStatus = [
    'available',
    'pending',
    'sold'
]

function isValidUrl(urlString) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator

    return !!urlPattern.test(urlString);
}

const { Controller, Get, Post, Put, Delete } = require("http/v4/rs/decorators");
const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoImg = require("codbex-petstore/gen/dao/Entities/photoUrl.js");
const daoTag = require("codbex-petstore/gen/dao/Entities/tag.js");

@Controller
class PetApi {

    @Post("/pet/:petId/uploadImage")
    uploadImage(body, ctx) {
        try {
            ["id", "imageUrl"].forEach(elem => {
                if (!body.hasOwnProperty(elem)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                }
            })

            if (!daoPet.find(body.id)) {
                ctx.res.sendStatus(http.NOT_FOUND);
                return;
            }

            if (!isValidUrl(body.imageUrl)) {
                ctx.res.sendStatus(400);
                return;
            }

            daoImg.create(body.id, body.imageUrl);
            ctx.res.sendStatus(http.OK);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Post("/pet")
    addPet(body, ctx) {
        try {
            ["name", "category", "status", "imageUrl", "tags"].forEach(elem => {
                if (!body.hasOwnProperty(elem)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                }
            })

            if (!petCategories.includes(body.category)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            if (!petStatus.includes(body.status)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            const newPet = daoPet.create(petData);

            if (!newPet) {
                throw new Error("Failed to create pet");
            }

            body.imageUrl.forEach((url) => {
                if (!isValidUrl(url)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                } else {
                    daoImg.create(newPet.id, url);
                }
            });

            body.tags.forEach((tag) => {
                daoTag.create(newPet.id, tag);
            });

            ctx.res.status(http.CREATED).json(newPet);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Put("/pet")
    updatePet(body, ctx) {
        try {
            ["id", "name", "category", "status", "imageUrl", "tags"].forEach(elem => {
                if (!body.hasOwnProperty(elem)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                }
            })

            const petId = body.id;
            const updateData = body;

            delete updateData.id;

            const pet = daoPet.get(body.id);

            if (!petCategories.includes(body.category)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            if (!petStatus.includes(body.status)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            body.imageUrl.forEach((url) => {
                daoImg.delete(url.id);
            })

            body.tags.forEach((tag) => {
                daoTag.delete(tag.id);
            })

            const updatedPet = daoPet.update(petId, updateData);

            if (!updatedPet) {
                ctx.res.sendStatus(http.NOT_FOUND);
                return;
            }

            body.imageUrl.forEach((url) => {
                if (!isValidUrl(url)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                } else {
                    daoImg.create(updatedPet.id, url);
                }
            });

            body.tags.forEach((tag) => {
                daoTag.create(newPet.id, tag);
            });

            ctx.res.status(http.OK).json(updatedPet);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Get("/pet/findByStatus")
    findPetsByStatus(body, ctx) {
        try {
            if (!body.hasOwnProperty("status")) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            if (!petStatus.includes(body.status)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            const status = body.status;

            const allPets = daoPet.list();

            const petsWithStatus = allPets.filter(pet => pet.status === status);

            ctx.res.status(http.OK).json(petsWithStatus);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Get("/pet/:petid")
    findPetById(body, ctx) {
        try {
            if (!body.hasOwnProperty("id")) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            const pet = daoPet.get(ctx.req.params.id);

            if (!pet) {
                ctx.res.sendStatus(http.NOT_FOUND);
                return;
            }

            ctx.res.status(http.OK).json(pet);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Post("/pet/:petid")
    updatePetById(body, ctx) {
        try {
            ["id", "name", "status"].forEach(elem => {
                if (!body.hasOwnProperty(elem)) {
                    ctx.res.sendStatus(http.BAD_REQUEST);
                    return;
                }
            });

            if (!petStatus.includes(body.status)) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            const updatedPet = daoPet.update(body);

            if (!updatedPet) {
                ctx.res.sendStatus(http.NOT_FOUND);
                return;
            }

            ctx.res.status(http.OK).json(updatedPet);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Delete("/pet/:petid")
    deletePetById(body, ctx) {
        try {
            if (!body.hasOwnProperty("id")) {
                ctx.res.sendStatus(http.BAD_REQUEST);
                return;
            }

            daoPet.delete(body.id);

            if (daoPet.get(body.id)) {
                ctx.res.sendStatus(http.NOT_FOUND);
                return;
            }

            ctx.res.sendStatus(http.NO_CONTENT);
        } catch (e) {
            ctx.res.println(e);
        }
    }
}

http.service({
    "/pet/:petId/uploadImage": {
        "post": [{
            "serve": (ctx, request, response) => {
                new PetApi().uploadImage(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }]
    },

    "/pet": {
        "post": [{
            "serve": (ctx, request, response) => {
                new PetApi().addPet(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }],
        "put": [{
            "serve": (ctx, request, response) => {
                new PetApi().updatePet(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }]
    },

    "/pet/findByStatus": {
        "get": [{
            "serve": (ctx, request, response) => {
                new PetApi().findPetsByStatus(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }]
    },

    "/pet/:petid": {
        "get": [{
            "serve": (ctx, request, response) => {
                new PetApi().findPetById(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }],
        "post": [{
            "serve": (ctx, request, response) => {
                new PetApi().updatePetById(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }],
        "delete": [{
            "serve": (ctx, request, response) => {
                new PetApi().deletePetById(ctx.req.body, ctx);
            },
            "catch": (ctx, err, request, response) => {
                response.println(err);
            }
        }]
    }
}).execute();
