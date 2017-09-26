![](https://www.dropbox.com/s/jlwm8lugx1bj5od/Screenshot%202017-08-31%2016.57.00.png?dl=1)

# Question-Answering

In this tutorial, you'll learn how to deploy a question-answering model trained on Stanford QA Dataset (SQuAD). Here's a sneak peak of the model demo:

![](https://www.dropbox.com/s/p5fo33fpjqraxj4/Screenshot%202017-09-18%2015.54.02.png?dl=1)

## What is SQuAD?

Stanford Question Answering Dataset (SQuAD) is a new reading comprehension dataset, consisting of questions posed by crowdworkers on a set of Wikipedia articles, where the answer to every question is a segment of text, or span, from the corresponding reading passage. With 100,000+ question-answer pairs on 500+ articles, SQuAD is significantly larger than previous reading comprehension datasets.
Explore SQuAD and model predictions


Checkout the GitHub repo at 
> [https://rajpurkar.github.io/SQuAD-explorer/](https://rajpurkar.github.io/SQuAD-explorer/)

## Step 1: Write Prediction

For this example, we'll use the code in [github.com/moxel/tf-bi-att-flow](http://github.com/moxel/tf-bi-att-flow), which already has the model inference part written out. 

Create a new script called `serve.py`, and import from existing modules.

```
from squad.demo_prepro import prepro
from basic.demo_cli import Demo
```

To serve the model with Moxel, all you need to write is an inference function. Let's call it `get_answer`: 

```
demo = Demo()

def get_answer(paragraph, question):
    pq_prepro = prepro(paragraph, question)
    return {
    	'answer': demo.run(pq_prepro)
    }
```

## Step 2: Write the YAML config.

Create a new file called `moxel.yml`. This Moxel config describes basic metadata about the model. 

```
name: question-answering
tag: latest
image: py3-tf-cpu
resources:
  memory: 1Gi
  cpu: "1"
input_space:
  paragraph: str
  question: str
output_space:
  answer: str
main:
  type: python
  entrypoint: serve.py::get_answer
```

It provides a few specs about the model:

* **name**: the repo name under *<username>/*.
* **tag**: versioning of the model.
* **image**: the docker image to serve the model in.
* **resources**: basic resource requirements for the model. If not specified, it will request 1 CPU and 1 GB of memory.
* **input_space**: the variables and their types for model input.
* **output_space**: the variables and their types for model output.
* **main**: the entrypoint to the model. For python deployment, specify the name of a function.


## Step 3 (Optional): Test it locally.

Before actually deploying the model, it's helpful to test and debug locally. Moxel provides 

```
moxel serve -f moxel.yml
```

This will wrap the python function in a flask server, and start listening at port `5900`.

To use the model, create a test script called `test_server.py`:

```
import moxel

model = moxel.Model('<username>/question-answering:latest', where='localhost')

output = model.predict({
    'paragraph': 'Daniel is 10 years old.',
    'question': 'How old is Daniel?'
})

print(output['answer'])
```

## Step 4: Deploy!

To deploy the model, it's simple. Just run

```
moxel push -f moxel.yml
```

You'll see logs streamed live from the model. Shortly, the model will be available under *beta.moxel.ai/<username>/question-answer*. 

Once you go to the model, spend time to make the page look nice, by adding model description, readme, labels, ... Share it on Facebook / Twitter, and have your friends try it out!

<br/>

