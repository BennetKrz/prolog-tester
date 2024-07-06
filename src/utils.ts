import * as vscode from 'vscode';
import { TextDocument, Uri } from "vscode";
import * as fs from "fs";

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
    return vscode.workspace.findFiles("**/*.{" + getFileExtensions().join(",") + "}");
}

export function isValidTestFile(file: TextDocument | Uri): boolean{
    var filePath = file instanceof Uri ? file.fsPath : (file as TextDocument).fileName;

    if(getFileExtensions().every(e => !filePath.endsWith("." + e))){
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

export function getTestInfosFromFile(file: Uri | TextDocument): [number, number, number, number] {
	var fileContent: string = file instanceof Uri ? fs.readFileSync(file.fsPath).toString() : file.getText();
    var lines: string[] = fileContent.split("\n");

    var startLine: number = 0;
    var startCharPos: number = 0;
    var endLine: number = 0;
    var endCharPos: number = 0;

    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(line.includes("begin_tests")){
            startLine = i;
            startCharPos = line.indexOf("begin_tests");
        }
        if(line.includes("end_tests")){
            endLine = i;
            endCharPos = line.indexOf("end_tests");
        }
    }
    return [startLine, startCharPos, endLine, endCharPos];
}

export function getFileExtensions() : string[] {
    const config : vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('prologtests');
    const fileExtensions : string[] |undefined = config.get<string[]>('testFileExtesions');

    return fileExtensions ? fileExtensions
                                .map(e => e.replace(".", "")) 
                          : ["pl", "plt"];
}