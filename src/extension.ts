import * as vscode from 'vscode';
import { CancellationToken, TestItem, TestRun, TestRunRequest, TextDocument, Uri } from 'vscode';
import { discoverAllFilesInWorkspace, getLabelFromTestSuitFile, getTestInfosFromFile, isValidTestFile } from './utils';
import { parseTestsInFile } from './parsing';
import { runTest } from './testRunner';
import { TestResult, TestResultKind } from './testResult';

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
		
		while(queue.length > 0 && !token.isCancellationRequested){
			const test = queue.shift();
			if(test){
				run.started(test);

				var results: TestResult[] = runTest(run, test);

				test.children.forEach(child => {
					var result: TestResult = results.filter(r => r.testName === child.id)[0];
					if(result.resultKind === TestResultKind.Passed){
						run.passed(child);
					} else {
						run.failed(child, new vscode.TestMessage(result.errorText ? result.errorText.join("\n") : ""), result.duration ? result.duration as number: undefined);
					}
				});

				if(token.isCancellationRequested){
					queue.forEach(test => {
						if(test.children){
							test.children.forEach(t => {
								run.skipped(t);
							});
						}
						run.skipped(test);
					});
					break;
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

	function registerTestFile(allTestsInFile: Set<[string, number, number, number, number]>, file: Uri | TextDocument): void {
		if(allTestsInFile.size === 0){
			return;
		}
		
		var id: string = file instanceof Uri ? file.fsPath : file.fileName;
		var uri: Uri = file instanceof Uri ? file : file.uri;
		
		var testSuit: TestItem = ctrl.createTestItem(id, getLabelFromTestSuitFile(file), uri);
		var testSuitRange: [number, number, number, number] = getTestInfosFromFile(file);
		testSuit.canResolveChildren = true;
		testSuit.range = new vscode.Range(testSuitRange[0], testSuitRange[1], testSuitRange[2], testSuitRange[3]);
		
		allTestsInFile.forEach(testInfos => {
			var test: TestItem = ctrl.createTestItem(testInfos[0], testInfos[0], uri);
			test.sortText = testInfos[0].padStart(5, "0");
			testSuit.children.add(test);
			test.range = new vscode.Range(testInfos[1], testInfos[2], testInfos[3], testInfos[4]);
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