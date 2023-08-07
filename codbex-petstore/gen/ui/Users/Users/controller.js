angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-petstore.Users.Users';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-petstore/gen/api/Users/Users.js";
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
					messageHub.showAlertError("Users", `Unable to count Users: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Users", `Unable to list Users: '${response.message}'`);
						return;
					}
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
			messageHub.showDialogWindow("Users-details", {
				action: "select",
				entity: entity,
				optionsuserStatusid: $scope.optionsuserStatusid,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Users-details", {
				action: "create",
				entity: {},
				optionsuserStatusid: $scope.optionsuserStatusid,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Users-details", {
				action: "update",
				entity: entity,
				optionsuserStatusid: $scope.optionsuserStatusid,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.id;
			messageHub.showDialogAsync(
				'Delete Users?',
				`Are you sure you want to delete Users? This action cannot be undone.`,
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
							messageHub.showAlertError("Users", `Unable to delete Users: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsuserStatusid = [];

		$http.get("/services/js/codbex-petstore/gen/api/entities/UserStatus.js").then(function (response) {
			$scope.optionsuserStatusid = response.data.map(e => {
				return {
					value: e.id,
					text: e.name
				}
			});
		});
		$scope.optionsuserStatusidValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsuserStatusid.length; i++) {
				if ($scope.optionsuserStatusid[i].value === optionKey) {
					return $scope.optionsuserStatusid[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
