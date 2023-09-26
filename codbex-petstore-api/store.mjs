import { rs } from "@dirigible/http"
const daoStore = require("codbex-petstore/gen/dao/Store/Store.js");
const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoUser = require("codbex-petstore/gen/dao/Users/Users.js");
const daoPetStatus = require("codbex-petstore/gen/dao/entities/PetStatus.js");
const daoOrderStatus = require("codbex-petstore/gen/dao/entities/OrderStatus.js");

const orderList = daoOrderStatus.list();
const orderStatus = [];
orderList.forEach(elem => { orderStatus.push(elem.name) });

const petList = daoPetStatus.list();
const petStatus = [];
petList.forEach(elem => { petStatus.push(elem.name) });

console.log(daoOrderStatus.list()[0].name);

function isValidDate(dateString) {
	const dateObj = new Date(dateString);
	return dateObj instanceof Date;
}

rs.service({
	"order": {
		"post": [{
			"serve": (_ctx, request, response) => {
				const body = request.getJSON();

				["petId", "quantity", "shipDate", "orderStatus", "userId"].forEach(elem => {
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

				body.orderStatusid = orderStatus.indexOf(body.orderStatus);

				if (body.orderStatusid == -1) {
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
				response.setContentType("application/json");
				response.println(JSON.stringify(newOrder));
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}]
	},

	"order/:orderId": {
		"get": [{
			"serve": (_ctx, request, response) => {
				const order = daoStore.get(request.params.orderId);

				if (!order) {
					response.println("Order not found!");
					response.setStatus(404);
					return;
				}

				response.setStatus(200);
				response.setContentType("application/json");
				response.println(JSON.stringify(order));
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}],

		"delete": [{
			"serve": (_ctx, request, response) => {
				const id = request.params.orderId;

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

	"inventory": {
		"get": [{
			"serve": (_ctx, _request, response) => {
				let allPets = daoPet.list();
				let map = {};

				petStatus.forEach((status) => {
					map[status] = 0;

					allPets.forEach((pet) => {
						if (petStatus[pet.petStatusid] === status) {
							map[status]++;
						}
					})
				})

				response.setContentType("application/json");
				response.println(JSON.stringify(map));
			},

			"catch": (_ctx, err, _request, response) => {
				response.println(err);
			}
		}]
	}
}).execute();