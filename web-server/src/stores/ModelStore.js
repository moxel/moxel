class ModelStoreClass {
	constructor() {
		this.formatModel = this.formatModel.bind(this)
		this.fetchModel = this.fetchModel.bind(this)
	}

	formatModel(userId, modelId, tag, data) {
		var model = {
            user: userId,
            id: modelId,
            tag: tag,
            status: data.status,
            title: "Untitled",
            description: "This is some magic machine learning model",
            readme: "(ReadME)",
            labels: ["deep learning"],
            links: {},
            stars: 0,
            lastUpdated: '1 days ago',
            inputType: {
            },
            outputType: {
            }
        };
    	
        for(var k in data.metadata) {
        	model[k] = data.metadata[k];
        }

        return model;
	}

	fetchModel(userId, modelId, tag) { 
		return new Promise(function(resolve) {
			fetch(`/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	console.log('resp', data)

	        	var model = this.formatModel(userId, modelId, tag, data);

	        	resolve(model);
	        }.bind(this));
		}.bind(this));
	}

	fetchModelAll() { 
		return new Promise(function(resolve) {
			fetch(`/api/users/_/models`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	var models = [];

	        	for(var row of data) {
	        		var parts = row.uid.split(':');
	                var tag = parts[1];
	                parts = parts[0].split('/')
	                var userId = parts[0];
	                var modelId = parts[1];

	        		var model = this.formatModel(userId, modelId, tag, row);
	        		models.push(model);
	        	}

	        	resolve(models);
	        }.bind(this));
		}.bind(this));
	}
};

const ModelStore = new ModelStoreClass();

export default ModelStore;