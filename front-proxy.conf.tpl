server {
        listen 80 default_server;

        #server_name _;

        location / {
                proxy_pass {{ minikube_server }};
        }
}