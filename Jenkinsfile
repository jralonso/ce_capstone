pipeline {
    agent any

    // to-do: Security Testing with Aqua
    environment {
        APP_NAME   = "hello-nodeapp"       
        DOCKER_APP = "jralonso/hello-nodeapp"
        TAG  = "${BUILD_TAG}"
        DOCKER_IMG  = "${DOCKER_APP}:${TAG}"
        STACK_NAME = "minikube-${env.BRANCH_NAME}"
        SERVER_ENV = "minikube-${env.BRANCH_NAME}" 
        DOCKER_CREDS = credentials('dockerhub-credentials')
        AWS_REGION   = "us-west-2"
        AWS_CREDS    = "aws_jenkins"
        CFN_PATH     = "cloudformation"
        CFN_MINIKUBE = "${CFN_PATH}/network-servers-stack.yml"
        CFN_PARAMS   = "${CFN_PATH}/stack-params.json"
        ANSIB_PATH = "ansible"
        ANSIB_CREDS = "aws_ansible"
        ANSIB_INV  = "${ANSIB_PATH}/ec2-servers-inventory.yml"
        CREATE_K8S       = "${ANSIB_PATH}/create-k8s-minukube.yml"
        DEPLOY_K8S_APP   = "${ANSIB_PATH}/deploy-k8s-app.yml"
        CONFIG_K8S_PROXY = "${ANSIB_PATH}/configure-k8s-nginx.yml"
    }
    
    stages {

        stage('Lint Node App and Dockerfile') {
            steps {         
                sh 'echo "Lint node app"'       
                sh "eslint 'app/**/*.js?(x)'"
                sh 'echo "Lint Dockerfile"'
                sh 'docker run --rm -i hadolint/hadolint < Dockerfile'    
            }
        }
        
        stage('Build Docker image and push to registry') {
            steps {
                sh 'echo "Building docker image"'
                sh 'docker build -t ${DOCKER_APP}:${TAG} .'
                sh 'docker login --username=$DOCKER_CREDS_USR --password=$DOCKER_CREDS_PSW'
                sh 'docker push ${DOCKER_APP}:${TAG}'
            }
        }    

        stage('Create/Update Network and Server for the environment') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: "${AWS_CREDS}") {                    
                    sh 'echo "Validate Minikube stack cloudformation template"'
                    cfnValidate(file:"${CFN_MINIKUBE}")
                    sh 'echo "Starting Minikube stack creation"'
                    cfnUpdate(stack:"${STACK_NAME}", file:"${CFN_MINIKUBE}", paramsFile:"${CFN_PARAMS}", timeoutInMinutes:10, tags:["Environment=${SERVER_ENV}"])
                }
            }
        }

        stage('Create a Kubernetes Cluster (Minikube)') {
            steps {ansiColor('xterm') {
                ansiblePlaybook( 
                    playbook: "${CREATE_K8S}",
                    // inventory: "${ANSIB_INV}", 
                    credentialsId: "${ANSIB_CREDS}",
                    colorized: true,
                    extraVars: [
                        stack_name: "${STACK_NAME}"
                        ]                   
                    ) 
                }                
            }
        }

        stage('Deploy app to K8s Minikube') {
            steps {ansiColor('xterm') {
                ansiblePlaybook( 
                    playbook: "${DEPLOY_K8S_APP}",
                    // inventory: "${ANSIB_INV}", 
                    credentialsId: "${ANSIB_CREDS}",
                    colorized: true,
                    extraVars: [
                        stack_name: "${STACK_NAME}",
                        image: "${DOCKER_IMG}",
                        app_name: "${APP_NAME}"
                        ]
                    ) 
                }                
            }
        }

        stage('Configure reverse proxy') {
            steps {ansiColor('xterm') {
                ansiblePlaybook( 
                    playbook: "${CONFIG_K8S_PROXY}",
                    // inventory: "${ANSIB_INV}", 
                    credentialsId: "${ANSIB_CREDS}",
                    colorized: true,
                    extraVars: [
                        stack_name: "${STACK_NAME}",
                        app_name: "${APP_NAME}"
                        ]
                    ) 
                }                
            }
        }

    }
}