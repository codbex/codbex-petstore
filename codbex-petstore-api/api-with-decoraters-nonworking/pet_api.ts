const { Controller, Get, Post, Put, Delete } = require("http/rs/decorators");

const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoImg = require("codbex-petstore/gen/dao/entities/PhotoUrl.js");
const daoTag = require("codbex-petstore/gen/dao/entities/Tag.js");
const daoPetStatus = require("codbex-petstore/gen/dao/entities/PetStatus.js");
const daoPetCategory = require("codbex-petstore/gen/dao/entities/PetCategory.js");

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

@Controller
class PetApi {

  @Post("/pet/:petId/uploadImage")
  uploadImage(body, ctx) {
    try {
      body.id = ctx.req.params.petId;

      ["id", "imageUrl"].forEach(elem => {
        if (!(elem in body)) {
          ctx.res.setStatus(400);
          ctx.res.println("Required more parameters");
          return;
        }
      });

      if (!daoPet.get(body.id)) {
        ctx.res.setStatus(404);
        ctx.res.println("Pet not found!");
        return;
      }

      if (!isValidUrl(body.imageUrl)) {
        ctx.res.setStatus(400);
        ctx.res.println("Invalid ImageUrl!");
        return;
      }

      const newImg = daoImg.create({ Petid: body.id, url: body.imageUrl });

      if (!daoImg.get(newImg)) {
        ctx.res.println("Failed image creation!");
        ctx.res.setStatus(400);
      }

    } catch (e) {
      ctx.res.println(e);
    }
  }

  @Post("/pet")
  addPet(body, ctx) {
    try {
      ["name", "category", "status", "imageUrl", "tags"].forEach(elem => {
        if (!(elem in body)) {
          ctx.res.setStatus(400);
          return;
        }
      });

      body.petCategoryid = petCategory.indexOf(body.category);

      if (body.petCategoryid == -1) {
        ctx.res.println("Invalid Category");
        ctx.res.setStatus(400);
        return;
      }

      body.petStatusid = petStatus.indexOf(body.status);

      if (body.petStatusid == -1) {
        ctx.res.println("Invalid status");
        ctx.res.setStatus(400);
        return;
      }

      const newPet = daoPet.get(daoPet.create(body));

      if (!newPet) {
        ctx.res.println("Could not create the pet");
        ctx.res.setStatus(500);
        return;
      }

      try {
        body.imageUrl.forEach((url) => {
          if (!isValidUrl(url)) {
            ctx.res.println("Invalid Url");
            ctx.res.setStatus(400);
            return;
          } else {
            daoImg.create({ Petid: newPet.id, url: url });
          }
        });
      } catch (e) {
        if (!isValidUrl(body.imageUrl)) {
          ctx.res.println("Invalid Url\n" + e);
          ctx.res.setStatus(400);
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

      ctx.res.setStatus(201)
      ctx.res.setContentType("application/json");
      ctx.res.println(JSON.stringify(newPet));

    } catch (e) {
      ctx.res.println(e);
    }
  }


  @Put("/pet")
  updatePet(body, ctx) {
    try {
      ["id", "name", "category", "status", "imageUrl", "tags"].forEach(elem => {
        if (!(elem in body)) {
          ctx.res.setStatus(400);
          ctx.res.println("U");
          return;
        }
      });

      body.petCategoryid = petCategory.indexOf(body.category);

      if (body.petCategoryid == -1) {
        ctx.res.println("Invalid Category");
        ctx.res.setStatus(400);
        return;
      }

      body.petStatusid = petStatus.indexOf(body.status);

      if (body.petStatusid == -1) {
        ctx.res.println("Invalid status");
        ctx.res.setStatus(400);
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
        ctx.res.setStatus(404);
        ctx.res.println("Pet not found");
        return;
      }

      daoPet.update(body);

      try {
        body.imageUrl.forEach((url) => {
          if (!isValidUrl(url)) {
            ctx.res.println("Invalid Url");
            ctx.res.setStatus(400);
            return;
          } else {
            daoImg.create(body.id, url);
          }
        });
      } catch (e) {
        if (!isValidUrl(body.imageUrl)) {
          ctx.res.println("Invalid Url\n" + e);
          ctx.res.setStatus(400);
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

      ctx.res.setStatus(200);
      ctx.res.setContentType("application/json");
      ctx.res.println(JSON.stringify(daoPet.get(body.id)));
    } catch (e) {
      ctx.res.println(e);
    }
  }


  @Get("/findByStatus")
  findPetsByStatus(_body, ctx) {
    try {
      const body = ctx.reqrequest.getJSON();
      if (!body.status) {
        ctx.res.setStatus(400);
        ctx.res.println("Status required!");
        return;
      }

      if (!petStatus.includes(body.status)) {
        ctx.res.setStatus(400);
        ctx.res.println("Invalid status!");
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

      ctx.res.setContentType("application/json");
      ctx.res.println(JSON.stringify(statusPets));
      ctx.res.setStatus(200);
    } catch (e) {
      ctx.res.println(e);
    }
  }


  @Get("/:petid")
  findPetById(_body, ctx) {
    try {
      const pet = daoPet.get(ctx.req.params.petid);

      if (!pet) {
        ctx.res.setStatus(404);
        ctx.res.println("Pet not found!")
        return;
      }
      ctx.res.setStatus(200);
      ctx.res.setContentType("application/json");
      ctx.res.println(JSON.stringify(pet));
    } catch (e) {
      ctx.res.println(e);
    }
  }


  @Post("/:petid")
  updatePetById(body, ctx) {

    try {
      body.id = ctx.req.params.petid;

      ["name", "status"].forEach(elem => {
        if (!(elem in body)) {
          ctx.res.setStatus(400);
          ctx.res.println("U");
          return;
        }
      });

      body.petStatusid = petStatus.indexOf(body.status);

      if (body.petStatusid == -1) {
        ctx.res.println("Invalid status");
        ctx.res.setStatus(400);
        return;
      }

      if (!daoPet.get(body.id)) {
        ctx.res.setStatus(404);
        ctx.res.println("Pet not found");
        return;
      }

      daoPet.update(body);

      ctx.res.setStatus(200)
      ctx.res.setContentType("application/json");
      ctx.res.println(JSON.stringify(daoPet.get(body.id)));

    } catch (e) {
      ctx.res.println(e);
    }

  }

  @Delete("/:petid")
  deletePetById(_body, ctx) {
    try {
      const id = ctx.req.params.petid;
      if (!id) {
        ctx.res.setStatus(404);
        ctx.res.println("Id not found");
        return;
      }

      daoPet.delete(id);

      if (daoPet.get(id)) {
        ctx.res.setStatus(404);
        ctx.res.println("Pet not found");
        return;
      }

      ctx.res.setStatus(204);
    } catch (e) {
      ctx.res.println(e);
    }
  }


}