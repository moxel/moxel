## Serving Model Locally
                        
To test if the model works locally, try 

```
moxel serve -f moxel.yml
```

This will start serving the model on your local machine. It listens for HTTP requests at port 5900. The easiest way to test it out is Moxel client:

import moxel

model = moxel.Model('strin/foo:latest', where='localhost')

output = model.predict(sentence="I am happy")
print(output)
```

