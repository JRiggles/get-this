import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// TODO: showActiveEditorWarning config stuff


export function activate(_context: vscode.ExtensionContext) {
	// // unix / linux require dotfile access, and will bail here if permission is not granted
	const platform = process.platform;
	if (platform === "darwin" || platform === "linux") {
        const config = vscode.workspace.getConfiguration();
        const permissionKey = 'getthis.shellConfigAccess'; // Key for storing permission state
        // check if the user has granted permission for dotfile access
        const hasPermission = config.get<boolean>(permissionKey);
		if (!hasPermission) {
			// ask the user for permission to modify dotfiles
			vscode.window.showInformationMessage(
				'This extension will add the environment variable "THIS"  to your default shell '
				+ 'configuration file (.bashrc, .zshrc, etc.). Are you okay with this?',
				"Yes",
				"No"
			).then((choice) => {
				if (choice === "Yes") {
					// store the permission state in settings.json
					config.update(permissionKey, true, vscode.ConfigurationTarget.Global)
						.then(() => {
							// log info, show notification to user
							console.log(
								"Get This! user has granted permission to modify shell config."
							);
							vscode.window.showInformationMessage("Get This! is ready to use");
							launch();
						});
				} else {
					// log info, show notification to user
					console.log("Get This! user has denied permission to modify shell config.");
					vscode.window.showInformationMessage("Understandable, have a nice day!");
					return; // bail
				}
			});
		} else {
			launch();  // *nix shell config access granted
		}
	} else {
		launch(); // we're running on windows, no special access needed
	}
}

function launch() {
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
		console.log();
		const filePath = editor.document.uri.fsPath;
		updateEnvVariable(filePath);
	} else {
		vscode.window.showWarningMessage("No active editor found.");
	}
}

function updateEnvVariable(filePath: string) {
	// get platform in order to handle setting environment variables in each case
	const platform = process.platform;

	switch (platform) {
		case "win32":
			console.log(`Get This! setting ${platform} env var %THIS%`);
			setWindowsEnvVariable(filePath);
			break;
		case "darwin":
		case "linux":
			console.log(`Get This! setting ${platform} env var $THIS`);
			setUnixEnvVariable(filePath);
			break;
		default:
			vscode.window.showErrorMessage(`Get This! Unsupported platform: ${platform}`);
			break;
	}
}

function setWindowsEnvVariable(filePath: string) {
	// TODO: make sure this doesn't pop up a new terminal on every tab change...ideally the user
	// wouldn't see anything at all
	const terminal = vscode.window.createTerminal();
	terminal.sendText(`setx THIS "${filePath}"`);
}

function setUnixEnvVariable(filePath: string) {
	updateDotfile(filePath);
}

function updateDotfile(filePath: string) {
	// in order to persist env vars in unix/linux, they need to be added to the users shell configs

	// determine the user's default shell, default to bash if SHELL is not set
	const defaultShell = process.env.SHELL || '/bin/bash';
	// determine the appropriate dotfile for the user's shell
	let dotfilePath: string;
	let isFish = false;  // assume they aren't using Fish shell until checking below

	if (defaultShell.endsWith('bash')) {
		dotfilePath = path.join(process.env.HOME || '', '.bashrc');
	} else if (defaultShell.endsWith('zsh')) {
		dotfilePath = path.join(process.env.HOME || '', '.zshrc');
	} else if (defaultShell.endsWith('fish')) {
		dotfilePath = path.join(process.env.HOME || '', '.config', 'fish', 'config.fish');
		isFish = true;
	} else {
		vscode.window.showErrorMessage(
			`Unsupported shell: ${defaultShell}. Unable to update shell configuration.`,
			'This extension currently only supports: Bash, Zsh, and Fish.'
		);
		return;
	}

	// append the environment variable to the appropriate dotfile
	fs.readFile(dotfilePath, 'utf8', (err, data) => {
		if (err) {
			vscode.window.showErrorMessage(
				`Get This! Error reading ${dotfilePath}: ${err.message}`
			);
			return;
		}

		// check if the THIS variable already exists in the dotfile
		const variableRegex = /\bTHIS\s*=\s*[^;\n]*/;
		if (data.match(variableRegex)) {
			// THIS variable already exists, replace it
			const updatedData = data.replace(variableRegex, `THIS=${filePath}`);
			// Wwite the updated data back to the dotfile
			fs.writeFile(dotfilePath, updatedData, 'utf8', (err) => {
				if (err) {
					vscode.window.showErrorMessage(
						`Get This! Error writing to ${dotfilePath}: ${err.message}`
					);
				} else {
					console.log(`Get This! THIS set to ${filePath} in ${dotfilePath}.`);
				}
			});
		} else {
			// THIS variable doesn't exist, append it to the dotfile
			const newVar = `${isFish ? 'set -x' : 'export'} THIS=${filePath};\n`;
			fs.appendFile(dotfilePath, newVar, (err) => {
				if (err) {
					vscode.window.showErrorMessage(
						`Get This! Error writing to ${dotfilePath}: ${err.message}`
					);
				} else {
					console.log(
						console.log(`Get This! THIS set to ${filePath} in ${dotfilePath}.`)
					);
				}
			});
		}
	});
}

export function deactivate() { }
