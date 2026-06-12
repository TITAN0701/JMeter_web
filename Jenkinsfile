pipeline {
    agent any

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    parameters {
        string(
            name: 'TEST_PLAN',
            defaultValue: 'tests/StartAirLines4.jmx',
            description: '[Basic] JMX path relative to Jenkins workspace.'
        )
        string(
            name: 'JMETER_BIN',
            defaultValue: 'C:\\Users\\suppo\\Desktop\\apache-jmeter-5.6.3\\apache-jmeter-5.6.3\\bin\\jmeter.bat',
            description: '[Basic] jmeter.bat path on this Jenkins agent.'
        )

        string(
            name: 'CONTROLLER_INDEX',
            defaultValue: '10',
            description: '[Controller] 1-based Simple/Transaction Controller position. Recommended when names contain Chinese.'
        )
        string(
            name: 'CONTROLLER_NAME',
            defaultValue: '',
            description: '[Controller] Simple/Transaction Controller name to enable. Empty keeps JMX enabled settings.'
        )
        booleanParam(
            name: 'CONTROLLER_IGNORE_CASE',
            defaultValue: true,
            description: '[Controller] Ignore case when matching controller name.'
        )
        booleanParam(
            name: 'CONTROLLER_REGEX',
            defaultValue: false,
            description: '[Controller] Treat CONTROLLER_NAME as regex.'
        )

        string(
            name: 'THREAD_GROUP_NAME',
            defaultValue: 'Thread Group',
            description: '[Thread Group] Thread Group to override. Empty applies to all Thread Groups.'
        )
        string(
            name: 'NUM_THREADS',
            defaultValue: '1',
            description: '[Thread Group] Number of users / threads.'
        )
        string(
            name: 'LOOP_COUNT',
            defaultValue: '1',
            description: '[Thread Group] Loop count override.'
        )
        string(
            name: 'RAMP_UP',
            defaultValue: '1',
            description: '[Thread Group] Ramp-up seconds override.'
        )
        string(
            name: 'DURATION_SECONDS',
            defaultValue: '300',
            description: '[Thread Group] Duration seconds override. Use -1 to keep JMX duration settings.'
        )
        booleanParam(
            name: 'THREAD_GROUP_IGNORE_CASE',
            defaultValue: true,
            description: '[Thread Group] Ignore case when matching Thread Group name.'
        )
        booleanParam(
            name: 'THREAD_GROUP_REGEX',
            defaultValue: false,
            description: '[Thread Group] Treat THREAD_GROUP_NAME as regex.'
        )
        booleanParam(
            name: 'COLLECT_SYSTEM_METRICS',
            defaultValue: true,
            description: '[System] Collect Jenkins/JMeter host CPU, memory, disk, network, process, and workspace metrics.'
        )
        string(
            name: 'SYSTEM_METRICS_INTERVAL_SECONDS',
            defaultValue: '5',
            description: '[System] System metrics sampling interval in seconds.'
        )
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
                    $metricsJob = $null

                    if ($env:COLLECT_SYSTEM_METRICS -eq "true") {
                        $metricsScript = Join-Path $env:WORKSPACE "scripts\\collect-system-metrics.ps1"
                        $metricsPath = Join-Path $env:WORKSPACE "reports\\system_metrics.csv"
                        $metricsJob = Start-Job -ScriptBlock {
                            param($ScriptPath, $OutputPath, $WorkspacePath, $IntervalSeconds)
                            & $ScriptPath -OutputPath $OutputPath -WorkspacePath $WorkspacePath -IntervalSeconds $IntervalSeconds
                        } -ArgumentList $metricsScript, $metricsPath, $env:WORKSPACE, ([int]$env:SYSTEM_METRICS_INTERVAL_SECONDS)
                        Write-Host "System metrics collection started: $metricsPath"
                    }

                    $runArgs = @{
                        JMeterBin = "$env:JMETER_BIN"
                        TestPlan = "$testPlan"
                        OutDir = "$env:WORKSPACE\\reports"
                        NumThreads = ([int]$env:NUM_THREADS)
                        LoopCount = ([int]$env:LOOP_COUNT)
                        RampUp = ([int]$env:RAMP_UP)
                        DurationSeconds = ([int]$env:DURATION_SECONDS)
                    }

                    if (-not [string]::IsNullOrWhiteSpace($env:CONTROLLER_INDEX)) {
                        $runArgs.ControllerIndex = ([int]$env:CONTROLLER_INDEX)
                    }

                    if (-not [string]::IsNullOrWhiteSpace($env:CONTROLLER_NAME)) {
                        $runArgs.ControllerName = "$env:CONTROLLER_NAME"
                        if ($env:CONTROLLER_REGEX -eq "true") { $runArgs.ControllerRegex = $true }
                        if ($env:CONTROLLER_IGNORE_CASE -eq "true") { $runArgs.ControllerIgnoreCase = $true }
                    }

                    if (-not [string]::IsNullOrWhiteSpace($env:THREAD_GROUP_NAME)) {
                        $runArgs.ThreadGroupName = "$env:THREAD_GROUP_NAME"
                        if ($env:THREAD_GROUP_REGEX -eq "true") { $runArgs.ThreadGroupRegex = $true }
                        if ($env:THREAD_GROUP_IGNORE_CASE -eq "true") { $runArgs.ThreadGroupIgnoreCase = $true }
                    }

                    try {
                        .\\runtest_with_report.ps1 @runArgs
                    } finally {
                        if ($null -ne $metricsJob) {
                            Stop-Job -Job $metricsJob -ErrorAction SilentlyContinue
                            Receive-Job -Job $metricsJob -ErrorAction SilentlyContinue | Write-Host
                            Remove-Job -Job $metricsJob -Force -ErrorAction SilentlyContinue
                            Write-Host "System metrics collection stopped."
                        }
                    }
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
            archiveArtifacts artifacts: 'reports/results_*.jtl,reports/summary_*.html,reports/html_*/**/*,reports/system_metrics.csv,jmeter.log,logs/**/*.log', allowEmptyArchive: true
        }
    }
}
