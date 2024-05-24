import * as vscode from 'vscode';
import { TestItem, TestRun } from "vscode";
import { TestResult } from "./testResult";
import { execSync } from "child_process";
import { parseTestResults } from './parsing';

export function runTest(run: TestRun, test: TestItem): TestResult[] {
    var result: TestResult[] = [];

    if(test.children && test.children.size > 0){

        var testSuitName: string = test.label;

        test.children.forEach(test => {
            run.started(test);
        });

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

export function getNameFromTestResultLine(line: string) {
    return line.substring(line.indexOf(":") + 1, line.indexOf(".") - 1);
}

export function getTestDurationOnFail(line: string): number | null {
    return line.includes("**FAILED") ? ((Number.parseFloat(line.substring(line.indexOf("(") + 1, line.indexOf(")") - 3))) * 1000) + 1 : null;
}
//Alle tests
//swipl -s geradeVorfahrtTest.pl -g run_tests -t halt

//Ein bestimmter test
//swipl -s geradeVorfahrtTest.pl -g "run_tests(geradeVorfahrtTest:0)" -t halt