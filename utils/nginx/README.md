# Load Balancer 

The network entrance to production cluster is a L7 load balancer hosted at the IP for `beta.dummy.ai`. 


    // edit nginx config.
    vi /etc/nginx/sites-available/dummy
    sudo service nginx restart

The Nginx server routes resource access to different parts of the cluster, including

- `/`    →    `/web` on `kube-master`    →    `web-server` in kube
- `/api/*` → `/api/*` on `kube-master` →   `master-server` (api-server) in kube
- `/git/*` → `/git/*` on `kube-master` → `/git/*`  on `master-server` which hosts git registry over HTTP.
- `/release/*` → `/release/*` on `kube-master` → `releaser` which hosts static release binaries.
