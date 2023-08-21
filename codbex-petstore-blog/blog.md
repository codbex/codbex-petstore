
# Building the [Pet Store API](https://github.com/codbex/codbex-petstore) with Eclipse Dirigible

APIs, or Application Programming Interfaces, define a set of rules that allow different software components to interact with each other. In this tutorial, we'll explore how to set up the Codbex pet store API using the Eclipse Dirigible platform. By following these steps, you can have your own pet store API up and running, ready to serve clients and customers. Happy coding!

## Why Eclipse Dirigible?

Before we delve into the setup and implementation, let's take a moment to understand why Eclipse Dirigible is an excellent choice for building APIs.

1. **All-in-One Platform**: Eclipse Dirigible provides a comprehensive set of tools and features, including a web IDE and runtime environment, all within a single platform.
2. **Cloud-Native**: Eclipse Dirigible is designed with cloud-native principles in mind. It offers features such as automatic scaling, containerization, and seamless integration with cloud services, ensuring that your API can handle varying workloads.
3. **Open Source**: Eclipse Dirigible is open-source software, which means you have access to its source code and can customize it to fit your needs.

## Prerequisites

Before we begin, ensure that you have Docker installed on your machine. Docker allows us to package our application and its dependencies into containers, ensuring consistent behavior across different environments.

### Step 1: Download Docker Images

To start building our pet store API, we need to download the Docker images containing the necessary components.

#### Pull the Docker Image

Execute the following command: 

```bash
docker pull ghcr.io/codbex/codbex-petstore:latest
```

### Step 2: Start Docker Container

With the Docker images downloaded, it's time to launch the containers for our pet store API. Execute the following command to start the container for the web image:

```bash
docker run -p 8080:8080 ghcr.io/codbex/codbex-petstore:latest
```

### Step 3: Access the Petstore API

Once the containers are up and running, you can access the Petstore API using the provided endpoints.

## Usage

Once you have Eclipse Dirigible set up, you can use the following endpoints provided by the API.

### Pet Endpoints

1. **PUT /pet.mjs** - Update an existing pet in the store.
2. **POST /pet.mjs** - Add a new pet to the store.
3. **GET /pet.mjs/findByStatus** - Find pets by status.
4. **GET /pet.mjs/{petId}** - Find a pet by its ID.
5. **POST /pet.mjs/{petId}** - Update a pet in the store with form data.
6. **DELETE /pet.mjs/{petId}** - Delete a pet from the store.
7. **POST /pet.mjs/{petId}/uploadImage** - Upload an image for a pet.

### Store Endpoints

1. **GET /store.mjs/inventory** - Returns pet inventories by status.
2. **POST /store.mjs/order** - Place an order for a pet.
3. **GET /store.mjs/order/{orderId}** - Find a purchase order by its ID.
4. **DELETE /store.mjs/order/{orderId}** - Delete a purchase order by its ID.

### User Endpoints

1. **POST /user.mjs** - Create a new user.
2. **POST /user.mjs/createWithList** - Create a list of users with a given input array.
3. **GET /user.mjs/{username}** - Get a user by their username.
4. **PUT /user.mjs/{username}** - Update a user.
5. **DELETE /user.mjs/{username}** - Delete a user.

## Removing the Docker Container

If you wish to remove the Docker container hosting the pet store API, you can use the following command:

```bash
docker rm codbex-petstore
```

## Conclusion

In this guide, we've set up the Codbex pet store API using Eclipse Dirigible and Docker. Now you have a handy API to manage pets, store inventory, and user data. Enjoy coding with Eclipse Dirigible!
