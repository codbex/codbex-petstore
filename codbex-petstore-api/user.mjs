import { rs } from "@dirigible/http";
import { database, sql } from "@dirigible/db";

const daoUsers = require("codbex-petstore/gen/dao/Users/Users.js");
const daoUserStatus = require("codbex-petstore/gen/dao/entities/userStatus.js");

// const userStatuses = ["Anonynous", "Active", "Inactive", "Blocked"];

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
    "user": {
        "post": [{
            "serve": (_ctx, request, response) => {
                createUser(request.getJSON(), response);
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },

    "user/createWithList": {
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

    "user/:username": {
        "get": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let script = sql.getDialect().select()
                    .column("USERS_FIRSTNAME").column("USERS_LASTNAME")
                    .column("USERS_EMAIL").column("USERS_PHONE")
                    .column("USERS_PROFILEURL").column("USERS_USERSTATUSID")
                    .from("CODBEX_USERS").where(`USERS_USERNAME = '${request.params.username}'`).build();

                let result = connection.prepareStatement(script).executeQuery().toJson(true);
                // let user = {
                //     username: result.getString("USERS_USERNAME"),
                //     firstname: result.getString("USERS_FIRSTNAME"),
                //     lastname: result.getString("USERS_LASTNAME"),
                //     email: result.getString("USERS_EMAIL"),
                //     phone: result.getString("USERS_PHONE"),
                //     profileUrl: result.getString("USERS_PROFILEURL"),
                //     userStatusid: result.getDate("USERS_USERSTATUSID").toISOString(),
                // };

                response.println(JSON.stringify(result))
                response.println("\n\n")
                connection.close();
                // response.println(JSON.stringify(user))
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
                connection.close();
            }
        }],
        "put": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let body = request.params.username;
                let script = sql.getDialect().update()
                    .set("USERS_USERNAME", body.username).set("USERS_FIRSTNAME", body.firstname)
                    .set("USERS_LASTNAME", body.lastname).set("USERS_PHONE", body.phone)
                    .set("USERS_PROFILEURL", body.profileUrl).set("USERS_USERSTATUSID", body.userStatusid)
                    .table("CODBEX_USERS").where(`USERS_USERNAME=${request.params.username}`).build();

                let result = connection.prepareStatement(script).executeQuery().next();


                response.println(JSON.stringify(result))
                response.println("\n\n")
                response.println(JSON.stringify(user))
            },
            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }],
        "delete": [{
            "serve": (_ctx, request, response) => {
                let connection = database.getConnection("DefaultDB");
                let body = request.params.username;
                let script = sql.getDialect().delete()
                    .from("CODBEX_USERS").where(`USERS_USERNAME=${request.params.username}`).build();

                let result = connection.prepareStatement(script).executeQuery().next();


                response.println(JSON.stringify(result))
                response.println("\n\n")
                response.println(JSON.stringify(user))
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
    response.println(JSON.stringify(newUser));
}