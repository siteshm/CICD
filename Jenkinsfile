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
                script { properties([parameters([string(defaultValue: '90', description: 'Prod app routing weight', name: 'Prod_Route'), string(defaultValue: '10', description: 'Canary app routing weight', name: 'Canary_Route'), string(defaultValue: '3', description: 'No of canary app replicas', name: 'CANARY_REPLICAS'), string(defaultValue: 'helloworld:latest', description: 'Please enter Docker Latest Image Version', name: 'Docker_Image_Version')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/canary_test']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        }
        
	stage('Deploy to Kubernetes cluster - Canary Deployment') {
	// when condition work on multibranch pipeline 
            //when { branch 'canary_test' }
			//environment {
			    //CANARY_REPLICAS = 3
			//}
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
        stage('DeployToProduction') {
            //when {
                //branch 'canary_test'
            //}
            //environment { 
                //CANARY_REPLICAS = 0
            //}
            steps {
                input 'Deploy to Production?'
                milestone(1)
		// Canary Yaml
		sh "sed -i 's/CANARY_REPLICAS/0/g' completecanary.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'completecanary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		// Deploy Yaml
		sh "sed -i 's/helloworld:latest/${Docker_Image_Version}/g' deploy.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istiogreen.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }
}
