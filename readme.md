# Petstore project with eclipse-dirigible

This API allows you to interact with a pet store application. It provides a set of endpoints to perform various operations related to pets, inventory, orders, and users. 


## Setup Instructions 
### Prerequisites - Docker installed on your machine 

### Step 1: 
Pull Docker Images To use the Petstore API, you need to pull the Docker images for the web UI and the runtime. 

#### Web UI 
Run the following command to pull the Docker image for the web IDE: 
``` docker pull ghcr.io/codbex/codbex-petstore:latest ``` 

#### Runtime 
Coming soon. 


### Step 2: 
Start Docker Containers Once you have pulled the Docker images, you can start the containers. #### Web UI Run the following command to start the container for the web IDE: 
``` docker run -p 8080:8080 ghcr.io/codbex/codbex-petstore:latest ``` 

#### Runtime 
Coming soon. 


### Step 3: 
Access the Petstore API Once the containers are up and running, you can access the Petstore API using the provided endpoints. 


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


## The EDM:

![emd-image](https://github-production-user-asset-6210df.s3.amazonaws.com/80454439/259375599-399094b7-78eb-4c47-a226-47f3fefe8f61.jpg)

## License 
This API is released under the Eclipse Public License - v 2.0. For more details, please refer to the [LICENSE](LICENSE) file. Please note that this API is for demonstration purposes only and should not be used in production environments.
