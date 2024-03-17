import * as vscode from "vscode";

// TODO: showActiveEditorWarning config stuff


export function activate(_context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	getActiveFilePath(editor); // get active editor's filepath at start
	pollForEditorChanges(); // continuously watch for active editor changes
}

async function editorChangeListener(): Promise<vscode.TextEditor | undefined> {
	// watch for changes to the active editor, return the editor once the change is complete
	return new Promise<vscode.TextEditor | undefined>((resolve) => {
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && !editor.document.isUntitled) {
				resolve(editor); // resolve promise on editor change, return editor
			}
		});
	});
}

async function pollForEditorChanges() {
	// wait for the editor change to be complete to avoid it being 'undefined',
	// continue to poll for editor changes every 200mS
	while (true) {
		const editor = await editorChangeListener();
		getActiveFilePath(editor);
		await new Promise(resolve => setTimeout(resolve, 200));
	}
}

function getActiveFilePath(editor: vscode.TextEditor | undefined) {
	// make sure there's an active editor, that it's been saved (not a new Untitled file), and that
	// the viewColumn is defined (avoids an issue where things like the "OUTPUT" tab are counted as
	// an editor when selected)
	if (editor && !editor.document.isUntitled && editor.viewColumn) {
		const thisFilePath = editor.document.uri.fsPath;
		updateIntegratedTerminalEnv(thisFilePath);
	} else {
		vscode.window.showWarningMessage("No active editor found.");
	}
}

function updateIntegratedTerminalEnv(thisFilePath: string) {
	// get platform in order to handle setting environment variables in each case
	const platform = process.platform;
	let terminalPlatform: string;
	switch (platform) {
		case "win32":
			terminalPlatform = 'terminal.integrated.env.windows';
			break;
		case "darwin":
			terminalPlatform = 'terminal.integrated.env.osx';
			break;
		case "linux":
			terminalPlatform = 'terminal.integrated.env.linux';
			break;
		default:
			vscode.window.showErrorMessage(`Get This! Unsupported platform: ${platform}`);
			return;
		}
	console.log(`Get This! set ${terminalPlatform} THIS`);
	let workspaceConfig = vscode.workspace.getConfiguration();
	let terminalConfig = workspaceConfig.get<any>(terminalPlatform, {});
	terminalConfig['THIS'] = thisFilePath;
	workspaceConfig.update(
		terminalPlatform,
		terminalConfig,
		vscode.ConfigurationTarget.Global
	);
}

export function deactivate() { }
