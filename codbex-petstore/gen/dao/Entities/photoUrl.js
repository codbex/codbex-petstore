const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "petstore_PHOTOURLS",
	properties: [
		{
			name: "id",
			column: "PHOTOURLS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
		{
			name: "url",
			column: "PHOTOURLS_URL",
			type: "VARCHAR",
		},
		{
			name: "Petid",
			column: "PHOTOURLS_PETID",
			type: "INTEGER",
		}
	]
});

exports.list = function (settings) {
	return dao.list(settings);
};

exports.get = function (id) {
	return dao.find(id);
};

exports.create = function (entity) {
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "petstore_PHOTOURLS",
		key: {
			name: "id",
			column: "PHOTOURLS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function (entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "petstore_PHOTOURLS",
		key: {
			name: "id",
			column: "PHOTOURLS_ID",
			value: entity.id
		}
	});
};

exports.delete = function (id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "petstore_PHOTOURLS",
		key: {
			name: "id",
			column: "PHOTOURLS_ID",
			value: id
		}
	});
};

exports.count = function () {
	return dao.count();
};

exports.customDataCount = function () {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "petstore_PHOTOURLS"');
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
	producer.queue("codbex-petstore/Entities/photoUrl/" + operation).send(JSON.stringify(data));
}