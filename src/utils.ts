import * as vscode from 'vscode';
import { TextDocument, Uri } from "vscode";
import * as fs from "fs";
import { parseTestsInFile } from './parsing';

export async function discoverAllFilesInWorkspace() {
    var validTestFiles: Uri[] = [];
    await getAllFilesWithEnding().then(files => {
        files.forEach(uri => {
            if(isValidTestFile(uri)){
                validTestFiles.push(uri);
            }
        });
    });
    return validTestFiles;
}

export function getAllFilesWithEnding() {
    return vscode.workspace.findFiles("**/*.{pl,plt}");
}

export function isValidTestFile(file: TextDocument | Uri): boolean{
    var filePath = file instanceof Uri ? file.fsPath : (file as TextDocument).fileName;

    if(!filePath.endsWith(".pl") && !filePath.endsWith(".plt")){
        return false;
    }
    
    var content: string;
    if(file instanceof Uri){
        content = fs.readFileSync(filePath).toString();
    } else {
        content = (file as TextDocument).getText();
    }
    return content.includes("begin_tests");
}

export function getLabelFromTestSuitFile(file: Uri | TextDocument): string {
    const regex = /.*begin_tests\(([^)]+)\)\./;
    var result: string = "";

    var fileContent: string = file instanceof Uri ? fs.readFileSync(file.fsPath).toString() : file.getText();
    var lines: string[] = fileContent.split("\n");

    for(var line of lines){
        const match = line.match(regex);
        if(match && match[1]){
            result = match[1];
            break;
        }
    }
    return result;
}