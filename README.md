Microservice to validate bank routing numbers and return details of the bank.

Automated Lambda to load routing number data from CSV into DynamoDB table.

![diagram](./images/diagram.png)


### Create and store clients in DynamoDB

```json
{
    "PK": {
        "S": "client id"
    },
    "valid": {
        # disable clients without deleting them
        "BOOL": true
    },
    "name": {
        "S": "client name"
    }

}
```

### Call the API

1. Call the API with path parameters for the 3 letter country code and 9 digit bank routing number.
```
https://endpoint/{country code}/{routing number}
```
2. Pass accept header `application/xml` to receive XML, otherwise response defaults to JSON.
```json
{
    "countryCode":"CAN",
    "routingNumber":"000000003",
    "name":"Snow Bank",
    "addressLine1":"South Pole",
    "addressLine2":"Extra Information"
}
```
```xml
<countryCode>CAN</countryCode>
<routingNumber>000000003</routingNumber>
<name>Snow Bank</name>
<addressLine1>South Pole</addressLine1>
<addressLine2>Extra Information</addressLine2>
```
### TODO List
- [x] refactor project file locations
- [x] convert to typescript
- [x] move database access functions to separate file
- [x] update database schema
- [x] add rate limiting
- [x] add custom authorizer with dynamodb clients
- [x] use GET with path params to allow for cacheing
- [x] log everything, use common logging framework
- [x] return JSON or XML based on accept header
- [x] add country code as path parameter
