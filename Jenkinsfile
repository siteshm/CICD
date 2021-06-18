pipeline {
    agent any
    environment {
        PROJECT_ID = 'arctic-robot-278510'
        CLUSTER_NAME = 'cluster-1'
        LOCATION = 'us-central1-c'
        CREDENTIALS_ID = 'gke'
    }
    stages {
        //stage('Setup parameters') {
            //steps {
                //script { properties([parameters([string(defaultValue: '3', description: 'No of canary app replicas', name: 'CANARY_REPLICAS')])])
                      // }
            //}
        //}
        stage("Checkout code") {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/canary_test']], extensions: [], userRemoteConfigs: [[credentialsId: 'GIT_CREDENTIALS', url: 'https://github.com/siteshm/CICD.git']]])
            }
        }
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("siteshm/hello:${env.BUILD_ID}")
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
	// when condition work on multibranch pipeline 
            //when { branch 'canary_test' }
			environment {
			    CANARY_REPLICAS = 3
			}
            steps{
                sh "sed -i 's/hello:canary/hello:${env.BUILD_ID}/g' canary.yaml"
                //sh "sed -i 's/MaxSurge/${MaxSurge}/g' canary.yaml"
                //sh "sed -i 's/MaxUnavailable/${MaxUnavailable}/g' canary.yaml"
		//sh "sed -i 's/CANARY_REPLICAS/${CANARY_REPLICAS}/g' canary.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'canary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
        stage('DeployToProduction') {
            //when {
                //branch 'canary_test'
            //}
            environment { 
                CANARY_REPLICAS = 0
            }
            steps {
                input 'Deploy to Production?'
                //milestone(1)
		sh "sed -i 's/hello:canary/hello:${env.BUILD_ID}/g' canary.yaml"
		//sh "sed -i 's/${CANARY_REPLICAS}/0/g' canary.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'canary.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		sh "sed -i 's/hello:latest/hello:${env.BUILD_ID}/g' deploy.yaml"
                //sh "sed -i 's/MaxSurge/${MaxSurge}/g' deploy.yaml"
                //sh "sed -i 's/MaxUnavailable/${MaxUnavailable}/g' deploy.yaml"
                step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'deploy.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
		step([$class: 'KubernetesEngineBuilder', projectId: env.PROJECT_ID, clusterName: env.CLUSTER_NAME, location: env.LOCATION, manifestPattern: 'istio.yaml', credentialsId: env.CREDENTIALS_ID, verifyDeployments: true])
            }
        }
    }
}
