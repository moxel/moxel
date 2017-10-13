# Serve Models Locally

You can serve models locally before uploading them to Moxel.

## Serve Models without Docker

To serve this model locally, simply run 

```
moxel serve -f moxel.yml
```

You will see Moxel starts `moxel-python-server` and loads `predict` function:

```
Using default resource setting map[cpu:1 memory:1Gi]
Locally serving model moxel/hello:latest.
Command: [moxel-python-driver --json {"asset_root":"/Users/tims/moxel/moxel/examples/perceptron","assets":[],"code_root":"/Users/tims/moxel/moxel/examples/perceptron","entrypoint":"serve.py::predict","input_space":{"sentence":"str"},"output_space":{"sentiment":"str"},"setup":[],"work_path":"."}]
Python driver version 0.0.2
Loaded prediction function <function predict at 0x1073f8c80>
 * Running on http://0.0.0.0:5900/ (Press CTRL+C to quit)
```

## Serve Models with Docker


This is as simple as 

```
moxel serve -f moxel.yml --docker
```

The docker will use `image` in the model yaml spec as Docker image .

## Testing locally

To test one of your local endpoints created above, create a test script:

```
import moxel

model = moxel.Model('<username>/question-answering:latest', where='localhost')

output = model.predict(
    paragraph='Daniel is 10 years old.', 
        question: 'How old is Daniel?'
        )

        print(output['answer'])
```

## Debug Moxel Drivers

To debug moxel drivers, set `DRIVER_DEV=1` environment variable when serving models locally.

```
DRIVER_DEV=1 moxel serve -f moxel.yml --docker
```
