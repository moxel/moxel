# Warpdrive CLI

Migrated from `strin/warpdrive`, with focus on machine learning deployment.


## Development

Install python dependencies first:

```
sudo pip install -r requirements.txt
```

Then install `warp` in environment mode:

```
sudo pip install -e .
```

### Set Up Secrets

`warp` relies on ssh keys to work. We save the keys under `secrets/` folder.


## Future Work

The CLI is written in python now. Consider using Go in the future for easier binary deployment.