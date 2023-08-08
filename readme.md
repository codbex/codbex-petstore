# Petstore project with eclipse-dirigible

This API allows you to interact with a pet store application. It provides a set of endpoints to perform various operations related to pets, inventory, orders, and users. 

## Installation 
To use this API, you need to have Eclipse Dirigible installed on your machine. Follow the official documentation of Eclipse Dirigible for installation instructions. 

## Usage 
Once you have Eclipse Dirigible set up, you can use the following endpoints provided by the API. 


### Pet Endpoints 

#### PUT `/pet`
Update an existing pet in the store. 

#### POST `/pet` 
Add a new pet to the store. 

#### GET `/pet/findByStatus` 
Find pets by status.

#### GET `/pet/{petId} `
Find a pet by its ID. 

#### POST `/pet/{petId}`
Update a pet in the store with form data. 

#### DELETE `/pet/{petId}` 
Delete a pet from the store. 

#### POST `/pet/{petId}/uploadImage` 
Upload an image for a pet. 


### Store Endpoints 

#### GET `/store/inventory` 
Returns pet inventories by status.

#### POST `/store/order` 
Place an order for a pet. 

### GET `/store/order/{orderId}` 
Find a purchase order by its ID. 

#### DELETE `/store/order/{orderId}` 
Delete a purchase order by its ID. 


### User Endpoints 

#### POST `/user` 
Create a new user. 

#### POST `/user/createWithList` 
Create a list of users with a given input array. 

#### GET `/user/{username}`
Get a user by their username. 

#### PUT `/user/{username}` 
Update a user. 

#### DELETE `/user/{username}` 
Delete a user. 


## 

## License 
This API is released under the Eclipse Public License - v 2.0. For more details, please refer to the [LICENSE](LICENSE) file. Please note that this API is for demonstration purposes only and should not be used in production environments.
