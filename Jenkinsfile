pipeline {
    agent any

    environment {
        STACKNAME = 'minikube'
        ENVIRONMENT = 'development'
    }
    
    stages {
        stage('Build Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {                    
                    sh 'echo "Validate Minikube stack cloudformation template"'
                    cfnValidate(file:'minikubestack.yaml')
                    sh 'echo "EC2 Minikube server creation"'
                    cfnUpdate(stack:'${STACKNAME}', file:'minikubestack.yaml', paramsFile:'stackparams.json', timeoutInMinutes:10, tags:['Environment=${ENVIRONMENT}'])
                }
            }
        }
        
        stage('Delete Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws_jenkins') {
                    sh 'echo "EC2 Minikube server creation with AWS user jenkins credentials AKA aws-static in jenkins"'
                    cfnDeleteStackSet(stackSet:'minikube-dev')
                }
            }
        }
    }
}