pipeline {
    agent any
    environment {
        PROJECT_ID = 'arctic-robot-278510'
        CLUSTER_NAME = 'cluster-1'
        LOCATION = 'us-central1-c'
        CREDENTIALS_ID = 'gke'
    }
    stages {
        stage('Setup parameters') {
            steps {
                script { properties([parameters([string(defaultValue: 'helloworld:2', description: 'Please enter Docker Image Version', name: 'Docker_Image_Version'), string(defaultValue: '10', description: 'Canary routing weight', name: 'Canary_Route')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/Initial_Release']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        } 
		stage('Deploy to Kubernetes cluster - Initial Release') {
            steps{
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'service.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                sh "sed -i 's/helloworld:latest/${Docker_Image_Version}/g' initialrelease.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'initialrelease.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }
}
