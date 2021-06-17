pipeline {
    agent any
    environment {
        PROJECT_ID = 'arctic-robot-278510'
        CLUSTER_NAME = 'cluster-1'
        LOCATION = 'us-central1-c'
        CREDENTIALS_ID = 'gke'
    }
    stages {
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
            //git credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git'
        }
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("siteshm/hello:latest")
                }
            }
        }
        
    }    
}
