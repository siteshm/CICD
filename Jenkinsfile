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
                script { properties([parameters([string(defaultValue: '50', description: 'Blue routing weight', name: 'Prod_Route'), string(defaultValue: '50', description: 'Green routing weight', name: 'Canary_Route'), string(defaultValue: '3', description: 'No of canary app replicas', name: 'CANARY_REPLICAS'), string(defaultValue: 'helloworld:latest', description: 'Please enter Docker Latest Image Version', name: 'Docker_Image_Version')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/test_istio']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        }
           
	stage('Deploy to Kubernetes cluster - Blue-Green Deployment') {
            steps{
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'service.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                sh "sed -i 's/helloworld:canary/${Docker_Image_Version}/g' canary.yaml"
		sh "sed -i 's/CANARY_REPLICAS/${CANARY_REPLICAS}/g' canary.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'canary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "sed -i 's/Prod_Route/${Prod_Route}/g' istio.yaml"
		sh "sed -i 's/Canary_Route/${Canary_Route}/g' istio.yaml"    
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
        stage('Deployment to PROD - Green') {
            steps {
		input message: 'Proceed to Green Deployment ?'
		sh "sed -i 's/${CANARY_REPLICAS}/0/g' canary.yaml"
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'canary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "sed -i 's/helloworld:latest/${Docker_Image_Version}/g' deploy.yaml"
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                input message: 'Switch traffic to green', parameters: [string(defaultValue: '100', description: 'Switch complete traffic to Green', name: 'CompleteBlueGreen')]
		sh "sed -i 's/${Canary_Route}/0/g' istio.yaml"
		sh "sed -i 's/${Prod_Route}/${CompleteBlueGreen}/g' istio.yaml"
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "echo 'Blue Green Deployment Completed. "
            }
        }
    }
}
