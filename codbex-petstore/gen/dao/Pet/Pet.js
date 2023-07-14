const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX-petstore_PET",
	properties: [
		{
			name: "id",
			column: "ENTITY1_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "category",
			column: "ENTITY1_CATEGORY",
			type: "VARCHAR",
		},
 {
			name: "name",
			column: "ENTITY1_NAME",
			type: "VARCHAR",
		},
 {
			name: "photoUrls",
			column: "ENTITY1_PHOTOURLS",
			type: "VARCHAR",
		},
 {
			name: "tags",
			column: "ENTITY1_TAGS",
			type: "VARCHAR",
		},
 {
			name: "status",
			column: "ENTITY1_STATUS",
			type: "VARCHAR",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX-petstore_PET",
		key: {
			name: "id",
			column: "ENTITY1_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX-petstore_PET",
		key: {
			name: "id",
			column: "ENTITY1_ID",
			value: entity.id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX-petstore_PET",
		key: {
			name: "id",
			column: "ENTITY1_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX-petstore_PET"');
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
	producer.queue("edm/Pet/Pet/" + operation).send(JSON.stringify(data));
}