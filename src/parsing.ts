import { TextDocument } from "vscode";
import * as fs from "fs";

export function parseTestsInFile(file: string | TextDocument): Set<string>{
    var content: string = typeof file === "string" ? fs.readFileSync(file as string).toString() : file.getText();
    var lines: string[] = content.split("\n");

    const regex = /.*test\(([^)]+)\).*/;

    var allTestsInFile: Set<string> = new Set<string>();

    lines.forEach(line => {
        const match = line.match(regex);
        if(match && match[1]){
            allTestsInFile.add(match[1]);
        }
    });
    return allTestsInFile;
}