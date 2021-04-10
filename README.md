Microservice to validate bank routing numbers.

Automated lambda to download and update routing number database monthly.

![diagram](./images/diagram.png)


### Create and store clients in DynamoDB

```
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


## TODO List
- [x] refactor project file locations
- [x] convert to typescript
- [x] move database access functions to separate file
- [x] update database schema
- [x] add rate limiting
- [x] add custom authorizer with dynamodb clients
- [x] use GET with path params to allow for cacheing

