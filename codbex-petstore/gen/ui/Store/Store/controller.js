angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-petstore.Store.Store';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-petstore/gen/api/Store/Store.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Store", `Unable to count Store: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Store", `Unable to list Store: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.shipDate) {
							e.shipDate = new Date(e.shipDate);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("Store-details", {
				action: "select",
				entity: entity,
				optionspetId: $scope.optionspetId,
				optionsuserId: $scope.optionsuserId,
				optionsorderStatusid: $scope.optionsorderStatusid,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Store-details", {
				action: "create",
				entity: {},
				optionspetId: $scope.optionspetId,
				optionsuserId: $scope.optionsuserId,
				optionsorderStatusid: $scope.optionsorderStatusid,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Store-details", {
				action: "update",
				entity: entity,
				optionspetId: $scope.optionspetId,
				optionsuserId: $scope.optionsuserId,
				optionsorderStatusid: $scope.optionsorderStatusid,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.id;
			messageHub.showDialogAsync(
				'Delete Store?',
				`Are you sure you want to delete Store? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Store", `Unable to delete Store: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionspetId = [];
		$scope.optionsuserId = [];
		$scope.optionsorderStatusid = [];

		$http.get("/services/js/codbex-petstore/gen/api/Pet/Pet.js").then(function (response) {
			$scope.optionspetId = response.data.map(e => {
				return {
					value: e.id,
					text: e.name
				}
			});
		});

		$http.get("/services/js/codbex-petstore/gen/api/Users/Users.js").then(function (response) {
			$scope.optionsuserId = response.data.map(e => {
				return {
					value: e.id,
					text: e.username
				}
			});
		});

		$http.get("/services/js/codbex-petstore/gen/api/entities/OrderStatus.js").then(function (response) {
			$scope.optionsorderStatusid = response.data.map(e => {
				return {
					value: e.id,
					text: e.name
				}
			});
		});
		$scope.optionspetIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionspetId.length; i++) {
				if ($scope.optionspetId[i].value === optionKey) {
					return $scope.optionspetId[i].text;
				}
			}
			return null;
		};
		$scope.optionsuserIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsuserId.length; i++) {
				if ($scope.optionsuserId[i].value === optionKey) {
					return $scope.optionsuserId[i].text;
				}
			}
			return null;
		};
		$scope.optionsorderStatusidValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsorderStatusid.length; i++) {
				if ($scope.optionsorderStatusid[i].value === optionKey) {
					return $scope.optionsorderStatusid[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
