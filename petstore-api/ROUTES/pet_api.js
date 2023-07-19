//              TODOS
//------------------------------------------
// TODO: add validation exception in all methods
// TODO: research whats the diferance between the two update methods

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
            ctx.res.sendStatus(BAD_REQUEST);
            return;
          }
        })

        if (!daoPet.find(body.id)) {
          ctx.res.sendStatus(NOT_FOUND);
          return;
        }

        if(!isValidUrl(body.imageUrl)){
            ctx.res.sendStatus(400);
            return;
        }

        daoImg.create(body.id, body.imageUrl);
        ctx.res.sendStatus(OK);
      } 

      catch (e) {
        ctx.res.println(e);
      }
    }


    @Post("/pet")
    addPet(body, ctx) {
      try {
        ["name", "category", "status", "imageUrl", "tags"].forEach(elem => {
          if (!body.hasOwnProperty(elem)) {
            ctx.res.sendStatus(BAD_REQUEST);
            return;
          }
        })

        if(!isValidUrl(body.imageUrl)){
            ctx.res.sendStatus(400);
            return;
        }

        if(!petCategories.includes(category)){
            ctx.res.sendStatus(400);
            return;
        }

        if(!petStatus.includes(status)){
            ctx.res.sendStatus(400);
            return;
        }

        const newPet = daoPet.create(petData);

        if (!newPet) {
          throw new Error("Failed to create pet");
        }

        res.status(201).json(newPet);
      } 

      catch (e) {
        res.println(e);
      }
    }


    @Put("/pet")
    updatePet(req, res, _ctx) {
      try {
        ["id", "name", "category", "status"].forEach(elem => {
          if (!req.params.hasOwnProperty(elem)) {
            res.sendStatus(BAD_REQUEST);
            return;
          }
        })

        const petId = req.params.id;
        const updateData = req.params;

        delete updateData.id;

        // 

        const updatedPet = daoPet.update(petId, updateData);

        if (!updatedPet) {
          res.sendStatus(NOT_FOUND);
          return;
        }

        res.status(200).json(updatedPet);
      } 

      catch (e) {
        res.println(e);
      }
    }


    @Get("/pet/findByStatus")
    findPetsByStatus(req, res, _ctx) {
      try {
        if (!req.params.hasOwnProperty("status")) {
          res.sendStatus(BAD_REQUEST);
          return;
        }

        const status = req.params.status;

        const allPets = daoPet.list();

        const petsWithStatus = allPets.filter(pet => pet.status === status);

        res.status(200).json(petsWithStatus);
      } 

      catch (e) {
        res.println(e);
      }
    }


    @Get("/pet/:petid")
    findPetById(req, res, _ctx) {
      try {
        if (!req.params.hasOwnProperty("id")) {
          res.sendStatus(BAD_REQUEST);
          return;
        }

        const pet = daoPet.get(req.params.id);

        if (!pet) {
          res.sendStatus(NOT_FOUND);
          return;
        }

        res.status(200).json(pet);
      } 

      catch (e) {
        res.println(e);
      }
    }


    @Post("/pet/:petid")
    updatePetById(_req, _res, _ctx) {

    //  whats the differance

    }

    @Delete("/pet/:petid")
    deletePetById(req, res, _ctx) {
      try {
        if (!req.params.hasOwnProperty("id")) {
          res.sendStatus(BAD_REQUEST);
          return;
        }

        daoPet.delete(req.params.id);

        if (daoPet.get(req.params.id)) {
          res.sendStatus(NOT_FOUND);
          return;
        }

        res.sendStatus(204);
      } 

      catch (e) {
        res.println(e);
      }
    }


}