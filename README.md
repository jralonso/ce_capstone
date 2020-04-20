This is the capstone project for the devops cloud nanodegree. The following topics are covered

# Scope of the project

Develop a pipeline that performs the following tasks:

- Lint our simple Node application using ESlint
- Lint the dockerfile before we build the docker image
- Tags the image and pushes it to docker hub
- Builds a simple AWS infraestructure using cloudformation
- Creates a kubernetes cluster in this infraestructure
- Deploys the container into the cluster and exposes the app

We also have to take the necessary steps to perform a blue-green deployment, so we can deploy new versions of our app with almost no interruption. to perform this task we have a reverse proxy which will be updated to forward the requests to the proper environment (blue/green) when it is created and the app is deployed.

# Pipeline stages

## Lint Node App and Dockerfile
In this stage the app is linted using ESlint

	sh "eslint 'app/**/*.js?(x)'"

The dockerfile is linted using hadolint. 
                
	sh 'docker run --rm -i hadolint/hadolint < Dockerfile'

## Build Docker image and push to registry
The next step is building the docker image:

	sh 'docker build -t ${DOCKER_APP}:${TAG} .'

and then pushing it to a registry from where it will be available to be deployed.

	sh 'docker push ${DOCKER_APP}:${TAG}'

## Create/Update Network and Server for the environment
Instead of building the AWS infraestructure in other pipeline, in this project it is built as part of the deployment process. 
This means that each time that the jenkins job is triggered, it will create or update the needed infraestructure to run the kubernetes cluster. If the stack for the green or blue deployment does not exist it will create it, and if the stack is present it will update it according to the provided template and/or parameters.

	cfnUpdate(stack:"${STACK_NAME}", file:"${CFN_MINIKUBE}", paramsFile:"${CFN_PARAMS}", timeoutInMinutes:10, tags:["Environment=${SERVER_ENV}"])

## Create a Kubernetes Cluster (Minikube)
In this stage we use Ansible to install a small kubernetes cluster (minikube) for development purpose. The ansible tasks in the playbook download kubectl, docker  minikube as well as some extra dependencies. At the end of the playbook minikube is started and the development cluster is ready to use.

	ansiblePlaybook( playbook: "${CREATE_K8S}", credentialsId: "${ANSIB_CREDS}", colorized: true, extraVars: [stack_name: "${STACK_NAME}"] )

Ansible expects a list of hosts to execute the playbook tasks, but our hosts list is dynamic, as it has been just created in the previous step. In the first step of the playbook we get the list of hosts from the created/updated stack using the cloudformation outputs. This is accomplished using the cloudformation_info ansible plugin and getting and getting the desired value like this"

	"{{ my_stack.cloudformation[stack_name].stack_outputs.MinikubeServerAddress }}"

As a future improvement, if the kubernetes cluster is already installed and running, these steps could be avoided instead of executed again.

## Deploy app to K8s Minikube
The app is deployed to Kubernetes using ansible. Again, the first step is building the list of hosts for the rest of the tasks and then deploy the app. The next task is to figure out if the app is already deployed, becouse if we try to create a new deployment with the same name of app it will fail, so this playbood creates a new deployment the first time, and if we run the job again on the same infraestructure it will update the deployment.

	"kubectl get deployment {{ app_name }}"

	"kubectl create deployment {{ app_name }} --image={{ image }}"

	"kubectl set image deployments/{{ app_name }} {{ app_name }}={{ image }}"

After the app has been deployed it will scale the number of pods to 4:

	"kubectl scale deployment {{ app_name }} --replicas=4"

And finally it will expose the app:

	"kubectl expose deployment {{ app_name }} --type=LoadBalancer --port=5000"


## Configure reverse proxy
The final stage covers the configuration of the two reverse proxies used to access the app. The first one is the entry point for the app in the cluster. It is just a nginx reverse installed in the same EC2 where the cluster is. This reverse proxy will forward the http requests from port 80 to the dynamic port provided when the service is exposed. To accomplish this a template is used that is updated with the proper information when the service is exposed:

	server {
	        listen 80 default_server;

	        #server_name _;

	        location / {
	                proxy_pass http://127.0.0.1:{{ cluster_port }};
	        }
	}


## The blue/green deployment
The other reverse proxy that is configured as the final step is the one that does the blue/green magic. This is the front reverse proxy that serves the app to the internet, and in the last step of the pipeline it will be configured to forward the http requests to the entry point of the cluster, that is, the previous nginx we have configured in the previous step. When the configuration of the proxy is changed, and the nginx service is restarted, it will start forwarding the requests to the most recent deployed app. 

## But we also have rolling updates here!
Due to the fact that we can deploy several times in a row in the same branch, if we proceed this way the pipeline will only create the deployment for this branch the first time the app is deployed. The next deployments will update the image with the new one from the repository, and in this case kubernetes will perform a rolling update on the 4 pods that we have configured.

# Improvements

There are lots... but a few could be:
- deploy to a production kubernetes cluster
- avoid restarting the front reverse proxy if we deploy several times in a row in the same branch
- Build the dynamic list of hosts once and pass this list all the ansible playbooks
- Include a security scanner
- ...
