for i in `docker images -f "dangling=true" -q `; do docker rmi  $i; done
