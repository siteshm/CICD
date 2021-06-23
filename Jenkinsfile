pipeline {
    agent any
    environment {
        PROJECT_ID = 'arctic-robot-278510'
        CLUSTER_NAME = 'istio'
        LOCATION = 'us-east1'
        CREDENTIALS_ID = 'gke'
    }
    stages {
        stage('Setup parameters') {
            steps {
                script { properties([parameters([string(defaultValue: 'hello:latest', description: 'Please enter Docker Latest Image Version', name: 'Docker_Image_Version')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/canary']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        }   
        stage('Deploy to Kubernetes cluster - Canary Release ') {
            steps{
                sh "sed -i 's/hello:latest/${Docker_Image_Version}/g' deploy.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'hpa.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'flagger.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }    
}
