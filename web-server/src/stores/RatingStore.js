class RatingStoreClass {
	constructor() {

	}

	fetchRating(userId, modelId) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/rating/${userId}/${modelId}`).then((response)=>{
	            return response.json();
	        }).then(function(data) {
	        	resolve(data["value"]);
	        }).catch(function() {
		        reject();
		    });
		}.bind(this));
	}

	updateRating(userId, modelId, value) {
		return new Promise(function(resolve, reject) {
			fetch(`/api/rating/${userId}/${modelId}`, {
				method: 'PUT',
				headers: new Headers({
					'Content-Type': 'text/plain'
				}),
				body: JSON.stringify({
					'value': value
				})
			}).then((response)=>{
				console.log('updateRating resp', response);
	            resolve();
	        }).catch(function() {
		        reject();
		    });
		});
	}
}

const RatingStore = new RatingStoreClass();

export default RatingStore;