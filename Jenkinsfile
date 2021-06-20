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
                script { properties([parameters([string(defaultValue: '2', description: 'maxSurge: The number of pods that can be created above the desired amount of pods during an update', name: 'MaxSurge'), string(defaultValue: '1', description: 'maxUnavailable: The number of pods that can be unavailable during the update process', name: 'MaxUnavailable'), string(defaultValue: '3', description: 'No of canary app replicas', name: 'CANARY_REPLICAS'), string(defaultValue: 'helloworld:latest', description: 'Please enter Docker Latest Image Version', name: 'Docker_Image_Version')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
            //git credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git'
        }
              
        stage('Deploy to Kubernetes cluster - Rolling Update ') {
            steps{
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'service.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                sh "sed -i 's/CANARY_REPLICAS/${CANARY_REPLICAS}/g' deploy.yaml" 
                sh "sed -i 's/MaxSurge/${MaxSurge}/g' deploy.yaml"
                sh "sed -i 's/MaxUnavailable/${MaxUnavailable}/g' deploy.yaml"
                sh "sed -i 's/helloworld:canary/${Docker_Image_Version}/g' deploy.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }    
}
