# Secrets Used by the Server

The Go server uses secrets such as user authentication, Google Cloud service accounts, etc. 

It is not secure to store them in the repo. 

Instead, 

**development**: Put secrets in this local folder.

**production**: We store them in a volume in cloud storage. The volume is mounted during deployment.