all: default-backend controller ingress

clean: clean-ingress clean-controller clean-default-backend

controller:
	kubectl create configmap nginx-template --from-file=nginx.tmpl=./nginx.tmpl
	kubectl create configmap kubeconfig --from-file=admin.conf=./admin.conf
	kubectl create -f ./controller.yml

ingress:
	kubectl apply -f ingress.yml

default-backend:
	kubectl create -f default-backend.yml

clean-default-backend:
	kubectl delete deploy default-http-backend
	kubectl delete service default-http-backend

clean-controller:
	kubectl delete service nginx-ingress
	kubectl delete deploy nginx-ingress-controller
	kubectl delete configmap nginx-template
	kubectl delete configmap kubeconfig
	
clean-ingress:
	kubectl delete ing dummy-ing

expose-nginx:
	kubectl expose deployment nginx-ingress-controller --type=LoadBalancer --name=nginx-ingress-controller
