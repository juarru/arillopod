# arillopod

Test exercise for Pod Group by Juan Arillo

## How to execute

First add the ```.env``` file attached to the sended email into the project root.  
Then, inside the project root, execute:

```javascript
node app.js
```  

The script generates a ```result.csv``` file into the csv folder of the project.

## Packages used

### dotenv

For managing environment files, in order to keep isolated sensible data ([dotenv](https://github.com/motdotla/dotenv)).

### mongodb

Package for managing mongo db connections and work with collections and data.

### request

Package for API connections.

### csvtojson

To generate a json from a csv file

### json-to-csv

Library that generates csv from a json object.