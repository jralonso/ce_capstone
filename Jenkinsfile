pipeline {
    agent any

    // to-do: Use variables in stackname and tags
    // to-do: Security Testing with Aqua
    environment {
        STACKNAME = "minikube-${env.BRANCH_NAME}"
        ENVIRONMENT = 'development'
        DOCKER_REPO = 'jralonso/hello-nodeapp'
        DOCKER_TAG = '0.1'
        DOCKER_CREDS = credentials('dockerhub-credentials')
    }
    
    stages {

        stage('Show branch name') {
            steps {
                echo 'Pulling...' + env.BRANCH_NAME
                echo "Stack name will be ${STACKNAME}"
            }
        }

        // Node app can be linted inside docker after it has been built

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
                // sh 'echo "Service user is $DOCKER_CREDS_USR"'
                // sh 'echo "Service password is $DOCKER_CREDS_PSW"'
                sh 'echo "Building docker image"'
                sh 'docker build -t ${DOCKER_REPO}:${DOCKER_TAG} .'
            }
        }        
        
        stage('Push image to registry') {
            steps {
                sh 'docker login --username=$DOCKER_CREDS_USR --password=$DOCKER_CREDS_PSW'
                sh 'docker push ${DOCKER_REPO}:${DOCKER_TAG}'
            }
        }

        stage('Build Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {                    
                    sh 'echo "Validate Minikube stack cloudformation template"'
                    cfnValidate(file:'minikubestack.yaml')
                    sh 'echo "Starting Minikube stack creation"'
                    cfnUpdate(stack:"${STACKNAME}", file:"minikubestack.yaml", paramsFile:"stackparams.json", timeoutInMinutes:10, tags:["environment=dev"])
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