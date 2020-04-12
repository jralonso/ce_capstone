pipeline {
    agent any

    // to-do: Use variables in stackname and tags
    // to-do: Security Testing with Aqua
    environment {
        STACKNAME = 'minikube01'
        ENVIRONMENT = 'development'
        DOCKER_REPO = 'jralonso/hello-nodeapp'
        DOCKER_TAG = '0.1'
    }
    
    stages {

        stage('Build Docker image') {
            
            environment {
                SERVICE_CREDS = credentials('dockerhub-credentials')
            }

            steps {
                sh 'echo "Service user is $SERVICE_CREDS_USR"'
                sh 'echo "Service password is $SERVICE_CREDS_PSW"'
                sh 'curl -u $SERVICE_CREDS https://myservice.example.com'
            }
            // steps {
            //     sh 'echo "Building docker image"'
            //     sh 'docker build -t ${DOCKER_REPO}:${DOCKER_TAG} .'
            // }
        }

        stage('Build Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {                    
                    sh 'echo "Validate Minikube stack cloudformation template"'
                    cfnValidate(file:'minikubestack.yaml')
                    sh 'echo "Starting Minikube stack creation"'
                    cfnUpdate(stack:'minikube01', file:'minikubestack.yaml', paramsFile:'stackparams.json', timeoutInMinutes:10, tags:['environment=dev'])
                }
            }
        }
        
        stage('Delete Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {
                    sh 'echo "Deleting Minikube stack"'
                    cfnDeleteStackSet(stackSet:'minikube01')
                }
            }
        }
    }
}