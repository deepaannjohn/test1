                            node {
                                cleanWs()
                                checkout scm
                                 stage("upload result") {

                                    try {
                                        def response = sh (
                                        script: """
                                                curl --location --request POST 'https://localhost/reporting-consumer/pluginEndpoint/5fbcdbcb14beca80d2a5d7d1/asocScan' \
                                                --header 'Content-Type: application/json' \
                                                --header 'Authorization: Bearer SOtdm2bA94e9DbPoOWe3SlYrpqGXOzttu2PP8P0m6AN3DjigU0n3UkrLvXhsFp7w8ykK8yydIJg0f9dOW5pTOw' \
                                                --d '{
	                                            "scanId":"a6c065e6-4e71-4e5e-ba9a-eea079c4725b",
                                                "buildUrl": "https://dev.azure.com/deepaannjohn1/Parts%20Unlimited/_build/results?buildId=217"
                                                }'
                                                """,
                                        returnStdout: true
                                        ).trim()

                                        echo response

                                        } catch (Exception e) {
                                            println "Error RUNNING SCAN: ${e}"

                                        }
           
                                    }

                                }