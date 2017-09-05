// @flow
import fs from 'fs';
import fetch from 'isomorphic-fetch'

// todo: add index.html loading
export default function HTMLLoader(req, res, next) {
    console.log('HTMLLoader', req.url)
    var HTML = fs.readFileSync(__dirname + '/../build/index.html').toString();
    const location = req.url.toString();
    var chunks = location.split('/');
    var url = req.protocol + '://' + req.hostname + location;

    var host = null;
    if(req.hostname == 'localhost') {
        host = 'localhost:3000'
    }else{
        host = req.hostname;
    }

    // Render meta tags on model page.
    console.log('chunks', chunks)
    if(chunks.length >= 5 && chunks[1] == 'models') {
        var userId = chunks[2];
        var modelId = chunks[3];
        var tag = chunks[4];
        console.log(`${req.protocol}://${host}/api/users/${userId}/models/${modelId}/${tag}`)
        fetch(`${req.protocol}://${host}/api/users/${userId}/models/${modelId}/${tag}`).then((response)=>{
            return response.json();
        }).then(function(modelData) {
        console.log('model data', modelData);
            HTML = HTML
                .replace("__META:OG:TITLE__", modelData.metadata.title)
                .replace("__META:OG:URL__", url)
                .replace("__META:OG:TYPE__", 'article')
                .replace("__META:OG:DESCRIPTION__", modelData.metadata.description);

            var labels = modelData.metadata.labels;
            if(!labels || labels.length == 0) {
                labels = ['deep learning']
            }

            HTML = HTML
                .replace("__META:AUTHOR__", "Moxel Inc.")
                .replace("__META:TITLE__", modelData.metadata.title)
                .replace("__META:DESCRIPTION__", modelData.metadata.description)
                .replace('__META:KEYWORDS__', labels.join(','));
            

            res.status(200).send(HTML);
        }).catch(function(e) {
            console.error(e);
        });

    }else if(chunks.length < 1 || chunks[1] != "fonts"){
        HTML = HTML
            .replace("__META:DESCRIPTION__", "World's Best Models, Built by Community")
            .replace("__META:KEYWORDS__", "Machine Learning,Model,Community,Artificial Intelligence, Deep Learning")
            .replace("__META:AUTHOR__", "Moxel Inc.")
            .replace("__META:TITLE__", "Moxel");
        
        console.log(HTML);
        res.status(200).send(HTML);
    }else{
        res.status(404).send();
    }
}
