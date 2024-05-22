import { ExtensionKind, TestItem, TestRun } from "vscode";
import { TestResult, TestResultKind } from "./testResult";
import { ExecException, ExecSyncOptionsWithStringEncoding, exec, execSync, spawn, spawnSync } from "child_process";

export async function runTest(run: TestRun, test: TestItem): Promise<TestResult> {
    //Hat children -> ist eine test suit, können alle aufeinmal laufen
    if(test.children && test.children.size > 0){
        console.log("Test Suit: " + test.uri?.fsPath);

        var testSuitName: string = test.label;

        test.children.forEach(test => {
            run.started(test);
        });

        try {
            const command = `swipl -s ${test.uri?.fsPath} -g "set_test_options([format(log)]) , (run_tests -> true ; true)" -t halt 2>&1`;

            const result = exec(command, {encoding: 'utf-8'}, (error, stdout, stderr) => {
                if(error){
                    throw error;
                }
                var testResults = parseTestResults("result.stdout?.emit");
                updateUIWithResults(testResults, test, run);
            });
        } catch (e){
            console.log("Error executing tests: " + e);
        }
    } else { //Nur einzelner test
        console.log("Einzelner Test" + test.uri?.fsPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new TestResult(TestResultKind.Passed, "Error Text", "warningText", "TestSuitName", "TestName", Date.now(), Date.now());
}

function parseTestResults(stdout: string): TestResult[] {
    var lines: string[] = stdout.split("\n");
    var line: string;
    return [];
}


function updateUIWithResults(testResults: TestResult[], test: TestItem, run: TestRun) {
    throw new Error("Function not implemented.");
}
//Alle tests
//swipl -s geradeVorfahrtTest.pl -g run_tests -t halt

//Ein bestimmter test
//swipl -s geradeVorfahrtTest.pl -g "run_tests(geradeVorfahrtTest:0)" -t halt