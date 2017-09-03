var chunks = window.location.pathname.split('/');

// Update meta tags.
function updateMeta(type, name, content) {
    var oldElement = document.querySelector(`meta[${type}='${name}']`);
    if(oldElement) {
        oldElement.remove()
    }
    var element = document.createElement('meta');
    element.setAttribute(type, name);
    element.setAttribute('content', content);    
    document.querySelector('head').appendChild(element);
    console.log('metadata updated', type, name, content, element);
}


if(chunks.length >= 5 && chunks[1] == 'models') {
	var userId = 'strin';
	var modelId = 'bi-att-flow';
	var tag = 'latest';
	fetch(`/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
        return response.json();
    }).then(function(modelData) {
      	document.title = `${modelData.metadata.title} | Moxel`;
		updateMeta('property', 'og:title', modelData.metadata.title + ' by ' + userId + ' | Moxel');
		updateMeta('property', 'og:type', 'article');
		updateMeta('property', 'og:url', document.URL);
		updateMeta('property', 'og:description', modelData.metadata.description);
		updateMeta('name', 'description', modelData.metadata.description);
		var labels = modelData.metadata.labels;
		if(labels && labels.length > 1) {
			updateMeta('name', 'keywords', labels.join(','));
		}
		updateMeta('name', 'author', modelData.user);
    }).catch(function(e) {
    	console.error(e);
    });
}
