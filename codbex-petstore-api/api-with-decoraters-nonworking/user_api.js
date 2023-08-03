const { Controller, Get, Post, Put, Delete } = require("http/v4/rs/decorators");

const dao = require("codbex-petstore/gen/dao/Users/Users");
const http = require("codbex-petstore/gen/api/utils/http");


@Controller
class UserApi {

    @Post("/user")
    createUser(body, ctx) {
        try {
            body.id = dao.create(body);
            http.sendResponseCreated(body);
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Post("/user/createWithList")
    createUserWithList(body, ctx) {
        body.forEach(elem => this.createUser(elem, ctx))
    }

    @Get("/user/login")
    loginUser(_body, _ctx) {

    }

    @Get("/user/logout")
    logoutUser(_body, _ctx) {

    }

    @Get("/user/:username")
    getUserByUsername(_body, _ctx) {

    }

    @Put("/user/:username")
    updateUserByUsername(_body, _ctx) {

    }

    @Delete("/user/:username")
    deleteUserByUsername(_body, _ctx) {

    }

}