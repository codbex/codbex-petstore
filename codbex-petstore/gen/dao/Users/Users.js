const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "petstore_USERS",
	properties: [
		{
			name: "id",
			column: "USERS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "username",
			column: "USERS_USERNAME",
			type: "VARCHAR",
		},
 {
			name: "firstname",
			column: "USERS_FIRSTNAME",
			type: "VARCHAR",
		},
 {
			name: "lastname",
			column: "USERS_LASTNAME",
			type: "VARCHAR",
		},
 {
			name: "email",
			column: "USERS_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "password",
			column: "USERS_PASSWORD",
			type: "VARCHAR",
		},
 {
			name: "phone",
			column: "USERS_PHONE",
			type: "VARCHAR",
		},
 {
			name: "status",
			column: "USERS_STATUS",
			type: "VARCHAR",
		},
 {
			name: "profileUrl",
			column: "USERS_PROFILEURL",
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
		table: "petstore_USERS",
		key: {
			name: "id",
			column: "USERS_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "petstore_USERS",
		key: {
			name: "id",
			column: "USERS_ID",
			value: entity.id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "petstore_USERS",
		key: {
			name: "id",
			column: "USERS_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "petstore_USERS"');
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
	producer.queue("codbex-petstore/Users/Users/" + operation).send(JSON.stringify(data));
}