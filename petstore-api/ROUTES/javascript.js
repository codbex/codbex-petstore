var response = require("http/response");

response.println("Hello World!");
response.flush();
response.close();