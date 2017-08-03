class ModelStoreClass {
	fetchModel(userId, modelId, tag) { 
		return new Promise(function(resolve) {
			fetch(`/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	console.log('resp', data)
	        	
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

	        	resolve(model);
	        });
		});
	}
};

const ModelStore = new ModelStoreClass();

export default ModelStore;