import * as vscode from 'vscode';
import { TestItem, TestRun } from "vscode";
import { TestResult, TestResultKind } from "./testResult";
import { exec, execSync } from "child_process";

export function runTest(run: TestRun, test: TestItem): TestResult[] {
    //Hat children -> ist eine test suit, können alle aufeinmal laufen
    var result: TestResult[] = [];

    if(test.children && test.children.size > 0){
        console.log("Test Suit: " + test.uri?.fsPath);

        var testSuitName: string = test.label;

        try {
            const command = `swipl -s ${test.uri?.fsPath} -g "set_test_options([format(log)]) , (run_tests(${testSuitName}) -> true ; true)" -t halt 2>&1`;

            var out = execSync(command, {encoding: 'utf-8'});
            return parseTestResults(out, testSuitName);
        } catch (e){
            console.log("Error executing tests: " + e);
        }
    } else { //Nur einzelner test
        console.log("Einzelner Test" + test.uri?.fsPath);
        
    }

    return result;
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
        if(line.includes("[") && line.includes(testSuitName)){
            var testName = getNameFromTestResultLine(line);
            var testFailed: boolean = line.includes("**FAILED");
            var nextIndex = getIndexOfNextTest(lines, i, testSuitName);
            var text = lines.slice(i + 1, nextIndex as number);
            
            var testResult: TestResult = new TestResult(testFailed ? TestResultKind.Failed : TestResultKind.Passed,
                testFailed ? text : null,
                testFailed ? null : text,
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
    return line.substring(line.indexOf(":") + 1, line.indexOf(".") - 1);
}

function getIndexOfNextTest(lines: string[], curIndex: number, suitName: string): Number {
    for(var i: number = curIndex + 1; i < lines.length; i++){
        if((lines[i].includes("[") && lines[i].includes(suitName)) || lines[i].includes("% End unit ")){
            return i;
        }
    }
    return curIndex;
}

function updateUIWithResults(testResults: TestResult[], test: TestItem, run: TestRun) {
    test.children.forEach(child => {
        var result: TestResult = testResults.filter(r => r.testName === child.id)[0];
        if(result.resultKind === TestResultKind.Passed){
            run.passed(child, result.endTime - result.startTime);
        } else {
            run.failed(child, new vscode.TestMessage(result.errorText ? result.errorText.join("\n") : ""), result.endTime - result.startTime);
        }
    });
}
//Alle tests
//swipl -s geradeVorfahrtTest.pl -g run_tests -t halt

//Ein bestimmter test
//swipl -s geradeVorfahrtTest.pl -g "run_tests(geradeVorfahrtTest:0)" -t halt