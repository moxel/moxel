# Containers

The system first mounts the following from NFS

1. `/script` - including the latest version of init script.
2. `/secrets` - credentials.
3. `/code` - the Git repository.

Then it runs 

```
/script/init
```




