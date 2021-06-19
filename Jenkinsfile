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
                script { properties([parameters([string(defaultValue: '90', description: 'Prod routing weight', name: 'Prod_Route'), string(defaultValue: '10', description: 'Canary routing weight', name: 'Canary_Route')])])
                       }
            }
        }
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/test_istio']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        }
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("siteshm/helloworld:${env.BUILD_ID}")
                }
            }
        }
        stage("Push image") {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                            myapp.push("latest")
                            myapp.push("${env.BUILD_ID}")
                    }
                }
            }
        }   
		stage('Deploy to Kubernetes cluster - Canary Deployment') {
            steps{
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'service.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                sh "sed -i 's/helloworld:canary/helloworld:${env.BUILD_ID}/g' canary.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'canary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "sed -i 's/helloworld:latest/hello:${env.BUILD_ID}/g' deploy.yaml"
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "sed -i 's/Prod_Route/${Prod_Route}/g' istio.yaml"
		sh "sed -i 's/Canary_Route/${Canary_Route}/g' istio.yaml"    
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
        stage('Complete Canary Deployment') {
            steps {
                input message: 'Select Complete Canary', parameters: [choice(choices: ['100'], description: 'Complete Canary - Prod Route Percentage', name: 'Complete_Canary')]
                milestone(1)
		sh "sed -i 's/${Canary_Route}/0/g' istio.yaml"
		sh "sed -i 's/${Prod_Route}/${Complete_Canary}/g' istio.yaml"
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "echo 'Canary Completed. "
            }
        }
    }
}
