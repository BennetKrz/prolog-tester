import * as vscode from 'vscode';
import { TextDocument, Uri } from "vscode";
import * as fs from "fs";
import { parseTestsInFile } from './parsing';

export function discoverAllFilesInWorkspace() {
    var validTestFiles: Uri[] = [];
    getAllFilesWithEnding().then(files => {
        files.forEach(uri => {
            if(isValidTestFile(uri)){
                validTestFiles.push(uri);
            }
        });
    });
    return validTestFiles;
}

export async function getAllFilesWithEnding() {
    return await vscode.workspace.findFiles("**/*.{pl,plt}");
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

    for(var line in lines){
        const match = line.match(regex);
        if(match && match[1]){
            result = match[1];
        }
    }
    return result;
}