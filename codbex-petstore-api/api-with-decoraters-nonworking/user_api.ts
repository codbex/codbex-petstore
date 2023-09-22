const { Controller, Get, Post, Put, Delete } = require("http/rs/decorators");

import { database, sql } from "@dirigible/db";

const daoUsers = require("codbex-petstore/gen/daoss.js");
const daoUserStatus = require("codbex-petstore/gen/dao/entitiesStatus.js");

const userStatuses = [];
const statusList = daoUserStatus.list();
statusList.forEach(elem => { userStatuses.push(elem.name) });

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
class UserApi {

    @Post("/")
    createUser(body, ctx) {
        try {
            ["username", "firstname", "lastname", "email", "password", "phone", "profileUrl", "userStatus"].forEach(elem => {
                if (!(elem in body)) {
                    ctx.res.setStatus(400);
                    return;
                }
            });

            body.userStatusid = userStatuses.indexOf(body.userStatus);

            if (body.userStatusid == -1) {
                ctx.res.println("userStatus is incorrect!")
                ctx.res.setStatus(400);
                return;
            }


            if (!isValidUrl(body.profileUrl)) {
                ctx.res.println("Invalid profileUrl -" + body.profileUrl);
                ctx.res.setStatus(400);
                return;
            }

            let newUser = daoUsers.get(daoUsers.create(body));

            if (!newUser) {
                ctx.res.println("Could not create the user");
                ctx.res.setStatus(500);
                return;
            }

            ctx.res.setStatus(201);
            ctx.res.setContentType("application/json");
            ctx.res.println(JSON.stringify(newUser));
        } catch (e) {
            ctx.res.println(e);
        }
    }

    @Post("/createWithList")
    createUserWithList(body, ctx) {
        body.forEach(elem => this.createUser(elem, ctx))
    }

    // @Get("/login")
    // loginUser(_body, _ctx) {

    // }

    // @Get("/logout")
    // logoutUser(_body, _ctx) {

    // }

    @Get("/:username")
    getUserByUsername(_body, ctx) {
        let connection = database.getConnection("DefaultDB");
        let script = sql.getDialect().select()
            .from("CODBEX_USERS").where(`USERS_USERNAME = '${ctx.req.params.username}'`).build();

        let result = connection.prepareStatement(script).executeQuery();
        let users = [];
        while (result.next()) {
            let user = {
                username: result.getString("USERS_USERNAME"),
                firstname: result.getString("USERS_FIRSTNAME"),
                lastname: result.getString("USERS_LASTNAME"),
                email: result.getString("USERS_EMAIL"),
                phone: result.getString("USERS_PHONE"),
                profileUrl: result.getString("USERS_PROFILEURL"),
                userStatusid: result.getString("USERS_USERSTATUSID"),
            };
            users.push(user);
        }

        if (users.length == 0) {
            ctx.res.setStatus(404);
            ctx.res.println("User Not Found!")
        } else if (users.length == 1) {
            ctx.res.setContentType("application/json");
            ctx.res.println(JSON.stringify(users[0]))
        } else {
            ctx.res.setContentType("application/json");
            ctx.res.println(JSON.stringify(users))
        }
        connection.close();
    }

    @Put("/:username")
    updateUserByUsername(body, ctx) {
        let connection = database.getConnection("DefaultDB");

        // check params in body
        if (body.username && body.firstname && body.lastname && body.phone && body.profileUrl && body.userStatus) {
            ctx.res.println("Bad ctx.req");
            ctx.res.setStatus(400);
            return;
        }

        let scriptSQL = sql.getDialect().update()
        if (body.username) scriptSQL.set("USERS_USERNAME", `'${body.username}'`)
        if (body.firstname) scriptSQL.set("USERS_FIRSTNAME", `'${body.firstname}'`)
        if (body.lastname) scriptSQL.set("USERS_LASTNAME", `'${body.lastname}'`)
        if (body.phone) scriptSQL.set("USERS_PHONE", `'${body.phone}'`)
        if (body.profileUrl) scriptSQL.set("USERS_PROFILEURL", `'${body.profileUrl}'`)

        if (body.userStatus) {
            body.userStatusid = userStatuses.indexOf(body.userStatus).toString();
            // get the statusid from a status
            if (body.userStatusid == -1) {
                ctx.res.println("userStatus is incorrect!")
                ctx.res.setStatus(400);
                return;
            }

            scriptSQL.set("USERS_USERSTATUSID", `'${body.userStatusid}'`)
        }


        let script = scriptSQL.table("CODBEX_USERS").where(`USERS_USERNAME = '${ctx.req.params.username}'`).build();

        let result = connection.prepareStatement(script).executeUpdate();

        ctx.res.setStatus(200)
        connection.close();
    }

    @Delete("/:username")
    deleteUserByUsername(_body, ctx) {
        let connection = database.getConnection("DefaultDB");
        let script = sql.getDialect().delete()
            .from("CODBEX_USERS").where(`USERS_USERNAME = '${ctx.req.params.username}'`).build();

        let result = connection.prepareStatement(script).executeUpdate();


        ctx.res.setStatus(204);
        connection.close();
    }

}