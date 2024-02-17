"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const childProcess = __importStar(require("child_process"));
let statusBarItem;
let lastModifiedDecorationType;
function activate(context) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);
    // Register command
    let disposable = vscode.commands.registerCommand("lastModifiedDateView", updateLastModified);
    context.subscriptions.push(disposable);
    // Update status bar when active text editor changes
    vscode.window.onDidChangeActiveTextEditor(updateLastModified);
    updateLastModified();
    // Show activation message
    vscode.window.showInformationMessage("Rapid Last Modified extension activated!");
    // Show developer name
    vscode.window.showInformationMessage("Developer Name: Ahsan Saeed");
}
exports.activate = activate;
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
        const decorations = [
            {
                range: new vscode.Range(editor.document.lineCount, 0, editor.document.lineCount, 0),
                renderOptions: {
                    after: {
                        contentText: lastModifiedDetails,
                        color: "#777777", // Light color
                    },
                },
            },
        ];
        editor.setDecorations(lastModifiedDecorationType, decorations);
    }
    else {
        statusBarItem.hide();
    }
}
// Function to get last modified details
function getLastModifiedDetails(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const lastModifiedTime = stats.mtime.toLocaleString();
        const userName = getUserName();
        return `Last modified by ${userName} on ${lastModifiedTime}`;
    }
    catch (error) {
        console.error(error);
        return "Unknown";
    }
}
// Function to get the username
function getUserName() {
    if (process.platform === "win32") {
        return os.userInfo().username;
    }
    else if (process.platform === "linux") {
        return childProcess.execSync("whoami").toString().trim();
    }
    else {
        return "Unknown";
    }
}
// Function to deactivate the extension
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map