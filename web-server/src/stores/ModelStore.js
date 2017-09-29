import yaml from 'js-yaml';

// ModelStore to fetch metdata.
// To get model spec, use Moxel JS client.
class ModelStoreClass {
	constructor() {
		this.formatModel = this.formatModel.bind(this)
		this.fetchModel = this.fetchModel.bind(this)
	}

	formatModel(userId, modelId, tag, data) {
		console.log('format model', data);
		var model = {
            user: userId,
            id: modelId,
            tag: tag,
            title: "Untitled",
            description: "A magicical machine learning model",
            labels: [],
            links: {},
            stars: 0,
            lastUpdated: '1 days ago',
            gallery: [],
            readme: ""
        };
    	
        for(var k in data.metadata) {
        	model[k] = data.metadata[k];
        }

        model["stars"] = parseInt(model["stars"]);
        model["status"] = data.status;

        return model;
	}

	fetchModel(userId, modelId, tag) { 
		var self = this;

		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	console.log('Model metadata', data)

	        	var model = self.formatModel(userId, modelId, tag, data);

	        	resolve(model);
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	getModelPageView(userId, modelName, tag) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelName}/${tag}/analytics/page-view`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	resolve(data);
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	getModelDemoRun(userId, modelName, tag) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelName}/${tag}/analytics/demo-run`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	resolve(data);
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	incrModelPageView(userId, modelName, tag) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelName}/${tag}/analytics/page-view`,
				{	
					method: 'PUT'
				}
			).then((response)=>{
				resolve();
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	incrModelDemoRun(userId, modelName, tag) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelName}/${tag}/analytics/demo-run`,
				{	
					method: 'PUT'
				}
			).then((response)=>{
				resolve();
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	deleteModels(userId, modelId) { 
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelId}`,
				{method: 'DELETE'}
			).then((response)=>{
	            resolve();
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	fetchModelAll() { 
		return new Promise(function(resolve) {
			fetch(`/api/users/_/models`).then((response)=>{
				console.log(response.text);
	            return response.json();
	        }).then(function(data) {	        	
	        	var models = [];
	        	
	        	if(data) {
	        		for(var row of data) {
		        		var parts = row.uid.split(':');
		                var tag = parts[1];
		                parts = parts[0].split('/')
		                var userId = parts[0];
		                var modelId = parts[1];

		        		var model = this.formatModel(userId, modelId, tag, row);
		        		models.push(model);
		        	}		
	        	}

	        	resolve(models);
	        }.bind(this));
		}.bind(this));
	}

	listModelTags(userId, modelId) {
		var self = this;
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelId}`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	var results = [];
	        	for(var model of data) {
	        		results.push(self.formatModel(userId, modelId, model.tag, model));
	        	}
	        	resolve(results);
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	listModel(userId) {
		var self = this;
		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	var results = [];
	        	for(var model of data) {
	        		results.push(self.formatModel(userId, model.id, model.tag, model));
	        	}
	        	resolve(results);
	        }).catch(function() {
		        reject();
		    });;
		});
	}

	updateModel(userId, modelId, tag, modelProps) {
		var body = {
			'metadata': yaml.safeDump(modelProps)
		};

		if(modelProps.status) {
			body['status'] = modelProps.status;
		}

		return new Promise(function(resolve, reject) {
			fetch(`/api/users/${userId}/models/${modelId}/${tag}`, {
				method: 'PUT',
				headers: new Headers({
					'Content-Type': 'application/json'
				}),
				body: JSON.stringify(body)
			}).then((response)=>{
				console.log(response);
				resolve();
	            return response;
		    });
		}.bind(this));
	}

	modelId(userId, model, tag) {
		return userId + "/" + model + ":" + tag;
	}
};

const ModelStore = new ModelStoreClass();

export default ModelStore;