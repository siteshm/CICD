pipeline {
    agent any
    stages {
        stage('Setup parameters') {
            steps {
                script { properties([parameters([string(defaultValue: 'helloworldeks:latest', description: 'Please enter Docker Latest Image Version', name: 'Docker_Image_Version')])])
                       }
            }
        } 
        stage("Build image") {
            steps {
                script {
                    myapp = docker.build("siteshm/helloworldeks:${env.BUILD_ID}")
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
        stage('Deploy to Kubernetes cluster - Canary Release ') {
            steps{
                sh "sed -i 's/helloworldeks:latest/helloworldeks:${env.BUILD_ID}/g' deploy.yaml"
                sh 'kubectl apply -f service.yaml'
                sh 'kubectl apply -f istio.yaml'
                sh 'kubectl apply -f deploy.yaml'
                sh 'kubectl apply -f hpa.yaml'
                sh 'kubectl apply -f flagger.yaml'
            }
        }
    }    
}
