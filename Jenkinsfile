node {
    cleanWs()
    checkout scm
    stage('ASoC') {
        try {
            
            appscan application: "05e67362-0020-446e-a61d-44cfc8072827", credentials: "asoc", name: "test-plugins", scanner: static_analyzer(hasOptions: false, target: "${WORKSPACE}"), type: "Static Analyzer", wait: true

        } catch (Exception e) {
            println "Error while performing ASoC scan: ${e}"
        }
    }
    }