import * as vscode from 'vscode';
import { TestItem, TestRun } from "vscode";
import { TestResult, TestResultKind } from "./testResult";
import { exec } from "child_process";

export async function runTest(run: TestRun, test: TestItem): Promise<TestResult> {
    //Hat children -> ist eine test suit, können alle aufeinmal laufen
    if(test.children && test.children.size > 0){
        console.log("Test Suit: " + test.uri?.fsPath);

        var testSuitName: string = test.label;

        test.children.forEach(test => {
            run.started(test);
        });

        try {
            const command = `swipl -s ${test.uri?.fsPath} -g "set_test_options([format(log)]) , (run_tests(${testSuitName}) -> true ; true)" -t halt 2>&1`;

            const result = exec(command, {encoding: 'utf-8'}, (error, stdout, stderr) => {
                if(error){
                    throw error;
                }
                var testResults = parseTestResults(stdout, testSuitName);
                var failedResults = testResults.filter(r => r.resultKind === TestResultKind.Failed);
                updateUIWithResults(testResults, test, run);
            });
        } catch (e){
            console.log("Error executing tests: " + e);
        }
    } else { //Nur einzelner test
        console.log("Einzelner Test" + test.uri?.fsPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new TestResult(TestResultKind.Passed, ["Error Text"], ["warningText"], "TestSuitName", "TestName", Date.now(), Date.now());
}

function parseTestResults(stdout: string, testSuitName: string): TestResult[] {
    console.log(stdout);
    var lines: string[] = stdout.split("\r\n");

    var isStart: boolean = true;
    var results: TestResult[] = [];

    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(isStart){
            if(!line.startsWith("% Start unit:")) {
                continue;
            }
            console.log("Jetzt beginnt der Tatsächliche Test Result");
            isStart = false;
            continue;
        }

        //Parsing:
        console.log(line);
        if(line.includes("[")){
            var testName = getNameFromTestResultLine(line);
            var testFailed: boolean = line.includes("**FAILED");
            var text: string[] = [];
            for(var k = i + 1; k < lines.length; k++){
                text.push(lines[k]);
            }
            var testResult: TestResult = new TestResult(testFailed ? TestResultKind.Failed : TestResultKind.Passed,
                testFailed ? text : null,
                null,
                testSuitName,
                testName,
                Date.now(),
                Date.now()
            );
            results.push(testResult);
        }
    }
    
    return results;
}

function getNameFromTestResultLine(line: string) {
    return line.substring(line.indexOf(":"), line.indexOf("."));
}

function updateUIWithResults(testResults: TestResult[], test: TestItem, run: TestRun) {
    throw new Error("Function not implemented.");
}
//Alle tests
//swipl -s geradeVorfahrtTest.pl -g run_tests -t halt

//Ein bestimmter test
//swipl -s geradeVorfahrtTest.pl -g "run_tests(geradeVorfahrtTest:0)" -t halt