import { TestItem } from "vscode";
import { TestResult, TestResultKind } from "./testResult";

export async function runTest(test: TestItem): Promise<TestResult> {
    //Hat children -> ist eine test suit, können alle aufeinmal laufen
    if(test.children){

    } else { //Nur einzelner test

    }

    return new TestResult(TestResultKind.Passed, "Hallo Welt", Date.now(), Date.now());
}