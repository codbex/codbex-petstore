import { rs } from "@dirigible/http";
import { database, sql } from "@dirigible/db";

const daoUsers = require("codbex-petstore/gen/dao/Users/Users.js");
const daoUserStatus = require("codbex-petstore/gen/dao/entities/userStatus.js");

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


rs.service({
    "": {
        "post": [{
            "serve": (_ctx, request, response) => {
                createUser(request.getJSON(), response);
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    "createWithList": {
        "post": [{
            "serve": (_ctx, request, response) => {
                let body = request.getJSON();

                body.forEach(elem => createUser(elem, response))
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    ":username": {
        "get": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let script = sql.getDialect().select()
                    .from("CODBEX_USERS").where(`USERS_USERNAME = '${request.params.username}'`).build();

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
                    response.setStatus(404);
                    response.println("User Not Found!")
                } else if (users.length == 1) {
                    response.setContentType("application/json");
                    response.println(JSON.stringify(users[0]))
                } else {
                    response.setContentType("application/json");
                    response.println(JSON.stringify(users))
                }
                connection.close();
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
                connection.close();
            }
        }],
        "put": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let body = request.getJSON();

                // check params in body
                if (body.username && body.firstname && body.lastname && body.phone && body.profileUrl && body.userStatus) {
                    response.println("Bad Request");
                    response.setStatus(400);
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
                        response.println("userStatus is incorrect!")
                        response.setStatus(400);
                        return;
                    }

                    scriptSQL.set("USERS_USERSTATUSID", `'${body.userStatusid}'`)
                }


                let script = scriptSQL.table("CODBEX_USERS").where(`USERS_USERNAME = '${request.params.username}'`).build();

                let result = connection.prepareStatement(script).executeUpdate();

                response.setStatus(200)
                connection.close();
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }],

        "delete": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let script = sql.getDialect().delete()
                    .from("CODBEX_USERS").where(`USERS_USERNAME = '${request.params.username}'`).build();

                let result = connection.prepareStatement(script).executeUpdate();


                response.setStatus(204);
                connection.close();
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

}).execute();



function createUser(body, response) {
    ["username", "firstname", "lastname", "email", "password", "phone", "profileUrl", "userStatus"].forEach(elem => {
        if (!(elem in body)) {
            response.setStatus(400);
            return;
        }
    });

    body.userStatusid = userStatuses.indexOf(body.userStatus);

    if (body.userStatusid == -1) {
        response.println("userStatus is incorrect!")
        response.setStatus(400);
        return;
    }


    if (!isValidUrl(body.profileUrl)) {
        response.println("Invalid profileUrl -" + body.profileUrl);
        response.setStatus(400);
        return;
    }

    let newUser = daoUsers.get(daoUsers.create(body));

    if (!newUser) {
        response.println("Could not create the user");
        response.setStatus(500);
        return;
    }

    response.setStatus(201);
    response.setContentType("application/json");
    response.println(JSON.stringify(newUser));
}