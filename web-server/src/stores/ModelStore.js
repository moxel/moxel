class ModelStoreClass {
	fetchModel(userId, modelId, tag) {
		fetch(`/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
            return response.json();
        }).then(function(data) {
            console.log(data);

            componentConfig.postUrl = data.url;
        });
	}
}

const ModelStore = new ModelStoreClass();

export default ModelStore;