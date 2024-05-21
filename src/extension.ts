import * as vscode from 'vscode';
import { CancellationToken, TestItem, TestRun, TestRunRequest, TextDocument, Uri } from 'vscode';
import { discoverAllFilesInWorkspace, getLabelFromTestSuitFile, isValidTestFile } from './utils';
import { parseTestsInFile } from './parsing';
import { runTest } from './testRunner';
import { TestResult } from './testResult';

var testSuits: Map<string, TestItem> = new Map<string, TestItem>();

export function activate(context: vscode.ExtensionContext) {

	const ctrl: vscode.TestController = vscode.tests.createTestController("PrologTestController", "Prolog Tests");

	ctrl.resolveHandler = async test => {
		if(!test){
			var validTestFiles: Uri[] = await discoverAllFilesInWorkspace();
			validTestFiles.forEach(uri => {
				registerTestFile(parseTestsInFile(uri.fsPath), uri);
			});
		}
	};

	vscode.workspace.onDidOpenTextDocument(e => parseTestsInDocument(e));
	vscode.workspace.onDidSaveTextDocument(e => parseTestsInDocument(e));
	vscode.window.onDidChangeActiveTextEditor(e => parseTestsInDocument(e?.document));

	const runProfile: vscode.TestRunProfile = ctrl.createRunProfile(
		"Run",
		vscode.TestRunProfileKind.Run,
		(request, token) => {
			runHandler(request, token);
		}
	);
	
	console.log('Congratulations, your extension "prolog-tester" is now active!');
	
	let disposable = vscode.commands.registerCommand('prolog-tester.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Prolog Tester!');
	});
	
	context.subscriptions.push(ctrl);
	context.subscriptions.push(disposable);
	
	async function runHandler(request: TestRunRequest, token: CancellationToken){
		const run: TestRun = ctrl.createTestRun(request);
		const queue: TestItem[] = [];

		var source = request.include ? request.include : ctrl.items;
		source.forEach(test => {
			queue.push(test);
		});

		token.onCancellationRequested(() => {
			queue.forEach(test => {
				run.skipped(test);
			});
			run.end();
		});

		while(queue.length > 0 && !token.isCancellationRequested){
			const test = queue.shift();
			if(test){
				run.started(test);
				var testResult: TestResult = await runTest(test);
				if(token.isCancellationRequested){
					run.skipped(test);
				} else if(testResult){
					run.passed(test);
				}
			}
		}
		run.end();
	}
	
	function parseTestsInDocument(document: vscode.TextDocument | undefined): void {
		if(document && isValidTestFile(document)){
			registerTestFile(parseTestsInFile(document), document);
		}
	}

	function registerTestFile(allTestsInFile: Set<string>, file: Uri | TextDocument): void {
		if(allTestsInFile.size === 0){
			return;
		}
		
		var id: string = file instanceof Uri ? file.fsPath : file.fileName;
		var uri: Uri = file instanceof Uri ? file : file.uri;
		
		var testSuit: TestItem = ctrl.createTestItem(id, getLabelFromTestSuitFile(file), uri);
		testSuit.canResolveChildren = true;
		
		allTestsInFile.forEach(testName => {
			var test: TestItem = ctrl.createTestItem(testName, testName, uri);
			test.sortText = testName.padStart(5, "0");
			testSuit.children.add(test);
		});
		
		testSuits.set(id, testSuit);
		
		updateTestExplorerUI();
	}
	
	function updateTestExplorerUI() {
		testSuits.forEach(testSuit => {
			ctrl.items.add(testSuit);
		});
	}	
}

export function deactivate() {}