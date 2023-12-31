angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-petstore.Pet.Pet';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-petstore/gen/api/Pet/Pet.js";
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
					messageHub.showAlertError("Pet", `Unable to count Pet: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Pet", `Unable to list Pet: '${response.message}'`);
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
			messageHub.showDialogWindow("Pet-details", {
				action: "select",
				entity: entity,
				optionspetStatusid: $scope.optionspetStatusid,
				optionspetCategoryid: $scope.optionspetCategoryid,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Pet-details", {
				action: "create",
				entity: {},
				optionspetStatusid: $scope.optionspetStatusid,
				optionspetCategoryid: $scope.optionspetCategoryid,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Pet-details", {
				action: "update",
				entity: entity,
				optionspetStatusid: $scope.optionspetStatusid,
				optionspetCategoryid: $scope.optionspetCategoryid,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.id;
			messageHub.showDialogAsync(
				'Delete Pet?',
				`Are you sure you want to delete Pet? This action cannot be undone.`,
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
							messageHub.showAlertError("Pet", `Unable to delete Pet: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionspetStatusid = [];
		$scope.optionspetCategoryid = [];

		$http.get("/services/js/codbex-petstore/gen/api/entities/PetStatus.js").then(function (response) {
			$scope.optionspetStatusid = response.data.map(e => {
				return {
					value: e.id,
					text: e.name
				}
			});
		});

		$http.get("/services/js/codbex-petstore/gen/api/entities/PetCategory.js").then(function (response) {
			$scope.optionspetCategoryid = response.data.map(e => {
				return {
					value: e.id,
					text: e.name
				}
			});
		});
		$scope.optionspetStatusidValue = function (optionKey) {
			for (let i = 0; i < $scope.optionspetStatusid.length; i++) {
				if ($scope.optionspetStatusid[i].value === optionKey) {
					return $scope.optionspetStatusid[i].text;
				}
			}
			return null;
		};
		$scope.optionspetCategoryidValue = function (optionKey) {
			for (let i = 0; i < $scope.optionspetCategoryid.length; i++) {
				if ($scope.optionspetCategoryid[i].value === optionKey) {
					return $scope.optionspetCategoryid[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
