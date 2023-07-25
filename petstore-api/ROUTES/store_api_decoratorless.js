const http = require("http/rs");

const daoStore = require("codbex-petstore/gen/dao/Store/Store.js");
const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoUser = require("codbex-petstore/gen/dao/Users/Users.js")

function isValidDate(dateString) {
	const dateObj = new Date(dateString);
	return dateObj instanceof Date;
}

const orderStatus = ['placed', 'delivered'];

const petStatus = ['available', 'pending', 'sold'];

http.service({
	"store/order": {
		"post": [{
			"serve": (_ctx, request, response) => {
				const body = request.getJSON();

				//response.println(body.petId);

				["petId", "quantity", "shipDate", "status", "userId"].forEach(elem => {
					if (!(elem in body)) {
						response.setStatus(404);
						response.println("U")
						return;
					}
				});

				const pet = daoPet.get(body.petId);

				if (!pet) {
					response.println("Pet not found!")
					response.setStatus(404);
					return;
				}

				const user = daoUser.get(body.userId);

				if (!user) {
					response.println("User not found!")
					response.setStatus(404);
					return;
				}

				if (body.quantity < 1) {
					response.println("Invalid Quantity");
					response.setStatus(400);
					return;
				}

				if (!isValidDate(body.shipDate)) {
					response.println("Invalid Ship Date");
					response.setStatus(400);
					return;
				}

				if (!orderStatus.includes(body.status)) {
					response.println("Invalid Status");
					response.setStatus(400);
					return;
				}

				const newOrder = daoStore.get(daoStore.create(body));

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

	"store/order/:orderId": {
		"get": [{
			"serve": (_ctx, request, response) => {
				const order = daoStore.get(request.params.orderId);

				if (!order) {
					response.println("Order not found!");
					response.setStatus(404);
					return;
				}

				response.setStatus(200);
				response.println(JSON.stringify(pet));
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}],

		"delete": [{
			"serve": (_ctx, request, response) => {
				const id = request.params.id;

				if (!id) {
					response.println("Invalid id");
					response.setStatus(400);
					return;
				}

				daoStore.delete(id);

				if (daoStore.get(id)) {
					response.println("Error deleting order");
					response.setStatus(404);
					return;
				}

				response.setStatus(204);
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}]
	},

	"store/inventory": {
		"get": [{
			"serve": (_ctx, _request, response) => {
				let allPets = daoPet.list();
				let map = {};

				petStatus.forEach((status) => {
					map[status] = 0;

					allPets.forEach((pet) => {
						if (pet.status === status) {
							map[status]++;
						}
					})
				})

				response.json(JSON.stringify(map));
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}]
	}
}).execute();