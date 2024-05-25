import * as vscode from 'vscode';
import { TestItem, TestRun } from "vscode";
import { TestResult } from "./testResult";
import { execSync } from "child_process";
import { parseTestResults } from './parsing';

export function runTest(run: TestRun, test: TestItem): TestResult[] | string[] {
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
        if(!test.parent){
            throw new Error("Test does not belong to a test Suit and cant be executed by prolog");
        }
        var testName = test.label;
        var testSuitName = test.parent.label;

        run.started(test);
        
        try {
            const command = `swipl -s ${test.uri?.fsPath} -g "set_test_options([format(log)]) , (run_tests(${testSuitName}:${testName}) -> true ; true)" -t halt 2>&1`;

            var startTime = Date.now();
            var out = execSync(command, {encoding: 'utf-8'});
            var endTime = Date.now();

            var results = parseTestResults(out, testSuitName);
            
            if(typeof results[0] === "string"){
                return results;
            }
            results[0].duration = endTime - startTime;
            return results;
        } catch (e){
            
        }

    }

    return result;
}

export function getTestDurationOnFail(line: string): number | null {
    return line.includes("**FAILED") ? ((Number.parseFloat(line.substring(line.indexOf("(") + 1, line.indexOf(")") - 3))) * 1000) + 1 : null;
}
//Alle tests
//swipl -s geradeVorfahrtTest.pl -g run_tests -t halt

//Ein bestimmter test
//swipl -s geradeVorfahrtTest.pl -g "run_tests(geradeVorfahrtTest:0)" -t halt