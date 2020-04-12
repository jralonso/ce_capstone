pipeline {
    agent any
    
    stages {
        stage('Create Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws-static') {
                    sh 'echo "EC2 Minikube server creation with AWS user jenkins credentials AKA aws-static in jenkins"'
                    def response = cfnValidate(file:'minikubestack.yaml')
                    echo "template description: ${response.description}"
                }
            }
        }
    }

    stages {
        stage('Delete Minikube Stack') {
            steps {
                withAWS(region: 'us-west-2', credentials: 'aws-static') {
                    sh 'echo "EC2 Minikube server creation with AWS user jenkins credentials AKA aws-static in jenkins"'
                    cfnDeleteStackSet(stackSet:'minikube-dev')
                }
            }
        }
    }
}