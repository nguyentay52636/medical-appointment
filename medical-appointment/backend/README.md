

### Config to run backend
- 1 Copy file **application.preperties.sample** then rename into **application.preperties**
- 2 Config your **application.preperties** to according to project
- 3 Create database Mysql for this project

### Api Documentation


Click this link to show the API documentation(if config server is at port 8080):

http://localhost:8080/swagger-ui/index.html#/

Api with end "jwt" will require login and get token to access.
For example: http://localhost:8080/api/users/jwt/test

Login and get access token, then add token "authorize" in the **top right**  of header swagger document. After then can use api end point with "../jwt/..a"