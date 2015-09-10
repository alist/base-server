#API Documentation for Base server 
    
##Status
Uri: /status
Description: Returns 200 if system status is good
    
##Login        
Uri: /login        
Verb: POST        
```
Body:        
     username: String        
    password: String        
    
Response:        
    200: Success        
    401: Unauthorized        
Response Body:        
{        
    token: TOKENSTRING        
}        
```    
    
NOTE: All of the below will require a token to be passed in the Authorization header with value    
“TOKENSTRING”

##Hello
Uri:/hello
Description: Test endpoint to ensure user data/ token system is working properly
Verb: Get
Response: User data object    
