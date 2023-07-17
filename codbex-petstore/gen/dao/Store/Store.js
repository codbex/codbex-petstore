const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-petstore/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_STORE",
	properties: [
		{
			name: "id",
			column: "STORE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "quantity",
			column: "STORE_QUANTITY",
			type: "INTEGER",
		},
 {
			name: "petId",
			column: "STORE_PETID",
			type: "INTEGER",
		},
 {
			name: "shipDate",
			column: "STORE_SHIPDATE",
			type: "DATE",
		},
 {
			name: "status",
			column: "STORE_STATUS",
			type: "VARCHAR",
		},
 {
			name: "complete",
			column: "STORE_COMPLETE",
			type: "BOOLEAN",
		},
 {
			name: "userId",
			column: "STORE_USERID",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "shipDate");
		EntityUtils.setBoolean(e, "complete");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "shipDate");
	EntityUtils.setBoolean(entity, "complete");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "shipDate");
	EntityUtils.setBoolean(entity, "complete");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_STORE",
		key: {
			name: "id",
			column: "STORE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "shipDate");
	EntityUtils.setBoolean(entity, "complete");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_STORE",
		key: {
			name: "id",
			column: "STORE_ID",
			value: entity.id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_STORE",
		key: {
			name: "id",
			column: "STORE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORE"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("codbex-petstore/Store/Store/" + operation).send(JSON.stringify(data));
}