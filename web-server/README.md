# Node.js Web Server


## Development

To start development in browser, 

```
npm run start:browser-dev
```

Environment variables:

* `NODE_ENV`: dev, production.
* `API_SERVER`: the address for API server.

### Configure Cloud Storage to Enable CORS

When the user is uploading data using the web client, sometimes the client will request urls like `example.storage.googleapis.com`. 

```
gsutil cors set cors/enable-gcloud.json gs://dummy-dev
```