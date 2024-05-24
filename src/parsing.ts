import { TextDocument } from "vscode";
import * as fs from "fs";
import { getNameFromTestResultLine, getTestDurationOnFail } from './testRunner';
import { TestResult, TestResultKind } from "./testResult";

export function parseTestsInFile(file: string | TextDocument): Set<[string, number, number, number, number]>{
    var content: string = typeof file === "string" ? fs.readFileSync(file as string).toString() : file.getText();
    var lines: string[] = content.split("\n");

    const regex = /.*test\(([^)]+)\).*/;

    var allTestsInFile: Set<[string, number, number, number, number]> = new Set<[string, number, number, number, number]>();

    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        const match = line.match(regex);
        var name: string;
        var startLine: number = i;
        var startCharPos: number;
        var endLine: number;
        var endCharPos: number;

        if(match && match[1]){
            name = match[1];
            startCharPos = line.indexOf("test");
            endLine = getIndexOfNextTestGeneral(lines, i) - 1;
            endCharPos = lines[endLine].lastIndexOf(".");
            allTestsInFile.add([name, startLine, startCharPos, endLine, endCharPos < 0 ? 0 : endCharPos]);
        }


    }
    return allTestsInFile;
}

function getIndexOfNextTestGeneral(lines: string[], curIndex: number): number {
    for(var i: number = curIndex + 1; i < lines.length; i++){
        if((lines[i].includes("test(")) || lines[i].includes("end_tests(")){
            return i;
        }
    }
    return curIndex;
}

export function parseTestResults(stdout: string, testSuitName: string): TestResult[] {
    var lines: string[] = stdout.split("\r\n");

    var isStart: boolean = true;
    var results: TestResult[] = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (isStart) {
            if (!line.startsWith("% Start unit:")) {
                continue;
            }
            isStart = false;
            continue;
        }

        //Parsing:
        console.log(line);
        if (line.includes("[") && line.includes(testSuitName)) {
            var testName = getNameFromTestResultLine(line);
            var testFailed: boolean = line.includes("**FAILED");
            var testDuration: number | null = getTestDurationOnFail(line);
            var nextIndex = getIndexOfNextTestResult(lines, i, testSuitName);
            var text = lines.slice(i + 1, nextIndex as number);

            var testResult: TestResult = new TestResult(testFailed ? TestResultKind.Failed : TestResultKind.Passed,
                testFailed ? text : null,
                testFailed ? null : text,
                testSuitName,
                testName,
                testDuration
            );
            results.push(testResult);
        }
    }

    return results;
}

function getIndexOfNextTestResult(lines: string[], curIndex: number, suitName: string): Number {
    for (var i: number = curIndex + 1; i < lines.length; i++) {
        if ((lines[i].includes("[") && lines[i].includes(suitName)) || lines[i].includes("% End unit ")) {
            return i;
        }
    }
    return curIndex;
}