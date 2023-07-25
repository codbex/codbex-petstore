const http = require("http/rs");

const daoUsers = require("codbex-petstore/gen/dao/Users/Users.js");

const userStatuses = ["Anonynous", "Active", "Inactive", "Blocked"];

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

const userStatus = ["Anonynous", "Active", "Inactive", "Blocked"];

http.service({
    "user": {
        "post": [{
            "serve": (_ctx, request, response) => {
                const body = request.getJSON();

                ["username", "firstname", "lastname", "email", "password", "phone", "profileUrl", "userStatus"].forEach(elem => {
                    if (!(elem in body)) {
                        response.setStatus(400);
                        return;
                    }
                });

                body.userStatusId = userStatuses.indexOf(body.userStatus);

                if (body.userStatusId == -1) {
                    response.println("userStatus is incorrect!")
                    response.setStatus(400);
                    return;
                }

                const user = daoUsers.get(daoUsers.create(body));

                if (!user) {
                    response.println("User was not created!")
                    response.setStatus(500);
                    return;
                }//!

                if (!isValidUrl(body.profileUrl)) {
                    response.println("Invalid profileUrl");
                    response.setStatus(400);
                    return;
                }

                newOreder = daoUsers.get(daoUsers.create(body));

                if (!newOrder) {
                    response.println("Could not create the order");
                    response.setStatus(500);
                    return;
                }

                response.setStatus(200);
                response.println(JSON.stringify(newOrder));
            },

            "catch": (_ctx, err, _request, response) => {
                response.println(err);
            }
        }]
    },
}).execute();