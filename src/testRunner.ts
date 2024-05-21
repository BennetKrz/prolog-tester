import { TestItem, TestRun } from "vscode";
import { TestResult, TestResultKind } from "./testResult";

export async function runTest(run: TestRun, test: TestItem): Promise<TestResult> {
    //Hat children -> ist eine test suit, können alle aufeinmal laufen
    if(test.children && test.children.size > 0){
        console.log("Test Suit: " + test.uri?.fsPath);
        
        var tests: TestItem[] = [];
        test.children.forEach(item => {
            tests.push(item);
        });

        for(var t of tests){
            run.started(t);
            await new Promise(resolve => setTimeout(resolve, 1000));
            run.passed(t);
        }
        
    } else { //Nur einzelner test
        console.log("Einzelner Test" + test.uri?.fsPath);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new TestResult(TestResultKind.Passed, "Hallo Welt", Date.now(), Date.now());
}