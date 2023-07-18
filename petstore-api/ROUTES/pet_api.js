//              TODOS
//------------------------------------------
// TODO: add validation exception in all methods
// TODO: does the find by status loop work
// TODO: research whats the diferance between the two update methods


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
        })

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
    addPet(req, res, _ctx) {
      try {
        ["name", "category", "status"].forEach(elem => {
          if (!req.params.hasOwnProperty(elem)) {
            res.sendStatus(BAD_REQUEST);
            return;
          }
        })

        const petData = {
          name: req.params.name,
          category: req.params.category,
          status: req.params.status
        };

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

        if (!isValidPetId(req.params.id)) {
          res.status(400).json({ error: "Invalid pet ID" });
          return;
        }

        const deletedPet = daoPet.delete(req.params.id);

        if (!deletedPet) {
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