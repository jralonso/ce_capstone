pipeline {
    agent any

    // to-do: Security Testing with Aqua
    environment {
        STACKNAME   = "minikube-${env.BRANCH_NAME}"
        SERVER_ENV  = "minikube-${env.BRANCH_NAME}"        
        DOCKER_REPO = "jralonso/hello-nodeapp"
        DOCKER_TAG  = "${env.BRANCH_NAME}-latest"
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
        
        stage('Lint Node App') {
            steps {         
                sh 'echo "Lint node app"'       
                sh "eslint 'app/**/*.js?(x)'"
            }
        }
        
        stage('Lint Dockerfile') {
            steps {
                sh 'echo "Lint Dockerfile"'
                sh 'docker run --rm -i hadolint/hadolint < Dockerfile'
            }
        }

        stage('Build Docker image') {
            steps {
                sh 'echo "Building docker image"'
                sh 'docker build -t ${DOCKER_REPO}:${DOCKER_TAG} .'
            }
        }        
        
        stage('Push image to registry') {
            steps {
                // sh 'echo "Service user is $DOCKER_CREDS_USR"'
                // sh 'echo "Service password is $DOCKER_CREDS_PSW"'
                sh 'docker login --username=$DOCKER_CREDS_USR --password=$DOCKER_CREDS_PSW'
                sh 'docker push ${DOCKER_REPO}:${DOCKER_TAG}'
            }
        }

        stage('Create/Update Network and Server for the environment') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: "${AWS_CREDS}") {                    
                    sh 'echo "Validate Minikube stack cloudformation template"'
                    cfnValidate(file:"${CFN_MINIKUBE}")
                    sh 'echo "Starting Minikube stack creation"'
                    cfnUpdate(stack:"${STACKNAME}", file:"${CFN_MINIKUBE}", paramsFile:"${CFN_PARAMS}", timeoutInMinutes:10, tags:["Environment=${SERVER_ENV}"])
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
                        target: "ec2-52-12-58-128.us-west-2.compute.amazonaws.com"
                        ]                   
                    ) 
                }                
            }
        }

        stage('Deploy app to K8s Minikube') {
            steps {ansiColor('xterm') {
                ansiblePlaybook( 
                    playbook: "${DEPLOY_K8S_APP}",
                    inventory: "${ANSIB_INV}", 
                    credentialsId: "${ANSIB_CREDS}",
                    colorized: true,
                    extraVars: [
                        target: "ec2-52-12-58-128.us-west-2.compute.amazonaws.com"
                        ]
                    ) 
                }                
            }
        }

        stage('Configure K8s ngins proxy') {
            steps {ansiColor('xterm') {
                ansiblePlaybook( 
                    playbook: "${CONFIG_K8S_PROXY}",
                    inventory: "${ANSIB_INV}", 
                    credentialsId: "${ANSIB_CREDS}",
                    colorized: true,
                    extraVars: [
                        target: "ec2-52-12-58-128.us-west-2.compute.amazonaws.com"
                        ]
                    ) 
                }                
            }
        }
        
        // stage('Delete Minikube Stack') {
        //     steps {
        //         withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {
        //             sh 'echo "Deleting Minikube stack"'
        //             cfnDelete(stack:'minikube01')
        //         }
        //     }
        // }
    }
}