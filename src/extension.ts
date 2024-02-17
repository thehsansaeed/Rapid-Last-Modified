import * as vscode from "vscode";
import * as fs from "fs";
import * as os from "os";
import * as childProcess from "child_process";

let statusBarItem: vscode.StatusBarItem;
let lastModifiedDecorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  context.subscriptions.push(statusBarItem);

  // Register command
  let disposable = vscode.commands.registerCommand(
    "lastModifiedDateView",
    updateLastModified
  );
  context.subscriptions.push(disposable);

  // Update status bar when active text editor changes
  vscode.window.onDidChangeActiveTextEditor(updateLastModified);
  updateLastModified();

  // Show activation message
  vscode.window.showInformationMessage(
    "Rapid Last Modified extension activated!"
  );

  // Show developer name
  vscode.window.showInformationMessage("Developer Name: Ahsan Saeed");
}

// Function to update last modified details
function updateLastModified() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const filePath = editor.document.uri.fsPath;
    const lastModifiedDetails = getLastModifiedDetails(filePath);
    statusBarItem.text = lastModifiedDetails;
    statusBarItem.show();
    // Remove previous decoration if exists
    if (lastModifiedDecorationType) {
      lastModifiedDecorationType.dispose();
    }
    // Display last modified at the end of the file
    lastModifiedDecorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: lastModifiedDetails,
        margin: "0px 0px 0px 10px",
        color: "#CCCCCC", // Light color
      },
    });
    const decorations: vscode.DecorationOptions[] = [
      {
        range: new vscode.Range(
          editor.document.lineCount,
          0,
          editor.document.lineCount,
          0
        ),
        renderOptions: {
          after: {
            contentText: lastModifiedDetails,
            color: "#777777", // Light color
          },
        },
      },
    ];
    editor.setDecorations(lastModifiedDecorationType, decorations);
  } else {
    statusBarItem.hide();
  }
}

// Function to get last modified details
function getLastModifiedDetails(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    const lastModifiedTime = stats.mtime.toLocaleString();
    const userName = getUserName();
    return `Last modified by ${userName} on ${lastModifiedTime}`;
  } catch (error) {
    console.error(error);
    return "Unknown";
  }
}

// Function to get the username
function getUserName(): string {
  if (process.platform === "win32") {
    return os.userInfo().username;
  } else if (process.platform === "linux") {
    return childProcess.execSync("whoami").toString().trim();
  } else {
    return "Unknown";
  }
}

// Function to deactivate the extension
export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
