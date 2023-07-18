const { Controller, Get, Post, Put, Delete } = require("http/v4/rs/decorators");
const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoImg = require("codbex-petstore/gen/dao/Entities/Entities.js");

@Controller
class PetApi {

    @Post("/pet/:petId/uploadImage")
    uploadImage(req, res, _ctx) {
      try {
        ["id", "imageUrl"].forEach(elem => {
          if (!req.params.hasOwnProperty(elem)) {
            res.sendStatus(BAD_REQUEST);
            return;
          }
        });

        if (!daoPet.find(req.params.id)) {
          res.sendStatus(NOT_FOUND);
          return;
        }

        daoImg.create(req.params.id, req.params.imageUrl);
        res.sendStatus(OK);
      } 

      catch (e) {
        res.println(e);
      }
    }


    @Post("/pet")
    addPet(_req, _res, _ctx) {

    }

    @Put("/pet")
    updatePet(_req, _res, _ctx) {

    }

    @Get("/pet/findByStatus")
    findPetsByStatus(_req, _res, _ctx) {

    }

    @Get("/pet/:petid")
    findPetById(_req, _res, _ctx) {

    }

    @Post("/pet/:petid")
    updatePetById(_req, _res, _ctx) {

    }

    @Delete("/pet/:petid")
    deletePetById(_req, _res, _ctx) {

    }

}