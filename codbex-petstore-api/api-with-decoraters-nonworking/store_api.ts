const { Controller, Get, Post, Delete } = require("http/rs/decorators");
const daoStore = require("codbex-petstore/gen/dao/Store/Store.js");
const daoPet = require("codbex-petstore/gen/dao/Pet/Pet.js");
const daoUser = require("codbex-petstore/gen/dao/Users/Users.js");
const daoPetStatus = require("codbex-petstore/gen/dao/entities/petStatus.js");
const daoOrderStatus = require("codbex-petstore/gen/dao/entities/orderStatus.js");

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



@Controller
class StoreApi {
	@Post("/order")
	orderPet(body, ctx) {
		try {
			["petId", "quantity", "shipDate", "orderStatus", "userId"].forEach(elem => {
				if (!(elem in body)) {
					ctx.res.setStatus(404);
					ctx.res.println("U")
					return;
				}
			});

			const pet = daoPet.get(body.petId);

			if (!pet) {
				ctx.res.println("Pet not found!")
				ctx.res.setStatus(404);
				return;
			}

			const user = daoUser.get(body.userId);

			if (!user) {
				ctx.res.println("User not found!")
				ctx.res.setStatus(404);
				return;
			}

			if (body.quantity < 1) {
				ctx.res.println("Invalid Quantity");
				ctx.res.setStatus(400);
				return;
			}

			if (!isValidDate(body.shipDate)) {
				ctx.res.println("Invalid Ship Date");
				ctx.res.setStatus(400);
				return;
			}

			body.orderStatusid = orderStatus.indexOf(body.orderStatus);

			if (body.orderStatusid == -1) {
				ctx.res.println("Invalid Status");
				ctx.res.setStatus(400);
				return;
			}

			const newOrder = daoStore.get(daoStore.create(body));

			if (!newOrder) {
				ctx.res.println("Could not create the order");
				ctx.res.setStatus(500);
				return;
			}

			ctx.res.setStatus(200);
			ctx.res.setContentType("application/json");
			ctx.res.println(JSON.stringify(newOrder));
		} catch (e) {
			ctx.res.printLn(e)
		}
	}

	@Get("/order/:orderId")
	findOrderById(_body, ctx) {
		try {
			const order = daoStore.get(ctx.req.params.orderId);

			if (!order) {
				ctx.res.println("Order not found!");
				ctx.res.setStatus(404);
				return;
			}

			ctx.res.setStatus(200);
			ctx.res.setContentType("application/json");
			ctx.res.println(JSON.stringify(order));
		} catch (e) {
			ctx.res.printLn(e)
		}
	}

	@Delete("/order/:orderId")
	deleteOrderById(_body, ctx) {
		try {
			const id = ctx.req.params.orderId;

			if (!id) {
				ctx.res.println("Invalid id");
				ctx.res.setStatus(400);
				return;
			}

			daoStore.delete(id);

			if (daoStore.get(id)) {
				ctx.res.println("Error deleting order");
				ctx.res.setStatus(404);
				return;
			}

			ctx.res.setStatus(204);
		} catch (e) {
			ctx.res.printLn(e)
		}
	}

	@Get("/inventory")
	petInventoryByStatus(_body, ctx) {
		try {
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

			ctx.res.setContentType("application/json");
			ctx.res.println(JSON.stringify(map));
		} catch (e) {
			ctx.res.printLn(e)
		}
	}
}