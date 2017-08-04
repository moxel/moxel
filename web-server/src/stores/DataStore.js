import request from "superagent"

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

class DataStoreClass {
	constructor() {

	}

	uuid(file) {
		return guid();
	}

	uploadData(userId, modelId, path, file) {
		fetch(`/api/url/data?user=${userId}&name=${modelId}&cloud=gcloud&path=${path}&verb=PUT`).then((response)=>{
        	return response.json();
        }).then(function(data) {
        	console.log(data);
        	var url = data.url;

        	request
             .put(url)
        	 .set('Content-Type','application/octet-stream')
        	 .send(file)
        	 .on('progress', e => {
        		console.log('Percentage done: ', e.percent);
        	  })
        	  .end((error, res) => {
        	  	if(error) return console.error('error',error)
        		if(res.statusCode !== 200) return console.error('Wrong status code')
        	});
            
        });
	}
}

const DataStore = new DataStoreClass();

export default DataStore;