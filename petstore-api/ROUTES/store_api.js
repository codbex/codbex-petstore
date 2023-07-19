const { Controller, Get, Post, Put, Delete } = require("http/v4/rs/decorators");
const daoStore = require("codbex-petstore/gen/dao/Store/Store.js");


@Controller
class StoreApi{
	@Post("/store/order")
	orderPet(body, ctx){

	}

	@Get("/store/order/:orderId")
	findOrderById(body, ctx){

	}

	@Delete("/store/order/:orderId")
	deleteOrderById(body, ctx){

	}

	@Get("/store/inventory")
	petInventoryByStatus(body, ctx){
		
	}
}