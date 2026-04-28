pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    parameters {
        string(name: 'JMETER_BIN', defaultValue: 'C:\\Users\\suppo\\Desktop\\apache-jmeter-5.6.3\\apache-jmeter-5.6.3\\bin\\jmeter.bat', description: 'Path to jmeter.bat on the Jenkins agent')
        string(name: 'TEST_PLAN', defaultValue: 'tests\\20260204_3.jmx', description: 'JMX test plan path relative to workspace')
        string(name: 'NUM_THREADS', defaultValue: '5', description: 'Thread count override')
        string(name: 'LOOP_COUNT', defaultValue: '3', description: 'Loop count override')
        string(name: 'RAMP_UP', defaultValue: '10', description: 'Ramp-up seconds override')
    }

    stages {
        stage('Prepare') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"
                    New-Item -ItemType Directory -Path "$env:WORKSPACE\\reports" -Force | Out-Null
                    Remove-Item -Path "$env:WORKSPACE\\reports\\results_*.jtl" -Force -ErrorAction SilentlyContinue
                    Remove-Item -Path "$env:WORKSPACE\\reports\\html_*" -Recurse -Force -ErrorAction SilentlyContinue
                '''
            }
        }

        stage('Run JMeter') {
            steps {
                powershell '''
                    $ErrorActionPreference = "Stop"

                    $testPlan = Join-Path $env:WORKSPACE $env:TEST_PLAN

                    .\\runtest_with_report.ps1 `
                        -JMeterBin "$env:JMETER_BIN" `
                        -TestPlan "$testPlan" `
                        -OutDir "$env:WORKSPACE\\reports" `
                        -NumThreads ([int]$env:NUM_THREADS) `
                        -LoopCount ([int]$env:LOOP_COUNT) `
                        -RampUp ([int]$env:RAMP_UP)
                '''
            }
        }

        stage('Publish Performance') {
            steps {
                perfReport(
                    sourceDataFiles: 'reports/results_*.jtl',
                    errorUnstableThreshold: 5,
                    errorFailedThreshold: 20,
                    failBuildIfNoResultFile: true,
                    showTrendGraphs: true
                )
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/results_*.jtl,reports/html_*/**/*,jmeter.log,logs/**/*.log', allowEmptyArchive: true
        }
    }
}
