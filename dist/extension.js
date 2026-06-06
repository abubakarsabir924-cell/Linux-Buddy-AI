/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
function activate(context) {
    const provider = new LinuxBuddyProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('linuxbuddy.chatView', provider));
}
class LinuxBuddyProvider {
    extensionUri;
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHTML();
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'chat') {
                try {
                    const response = await fetch('http://127.0.0.1:8000/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message.text })
                    });
                    const data = await response.json();
                    webviewView.webview.postMessage({ reply: data.reply });
                }
                catch {
                    webviewView.webview.postMessage({ reply: 'Server nahi mila — pehle server chalao!' });
                }
            }
            if (message.command === 'start') {
                vscode.commands.executeCommand('workbench.action.terminal.new');
                setTimeout(() => {
                    vscode.window.activeTerminal?.sendText('source ~/linuxbuddy-env/bin/activate && export OPENROUTER_API_KEY="tumhari_key" && python3 ~/linuxbuddy/main.py');
                }, 1000);
            }
        });
    }
    getHTML() {
        return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #1a1a1a; color: #ececec; font-family: -apple-system, sans-serif; height: 100vh; display: flex; flex-direction: column; }
.chat-area { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.message { display: flex; flex-direction: column; gap: 4px; }
.message.user { align-items: flex-end; }
.message.ai { align-items: flex-start; }
.label { font-size: 11px; color: #888; }
.bubble { max-width: 90%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
.user .bubble { background: #2f2f2f; }
.ai .bubble { background: transparent; padding-left: 0; }
.input-area { padding: 12px; border-top: 1px solid #2f2f2f; display: flex; flex-direction: column; gap: 8px; }
textarea { background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 10px; padding: 10px; color: #ececec; font-size: 13px; resize: none; outline: none; font-family: inherit; width: 100%; }
.buttons { display: flex; justify-content: space-between; }
.start-btn { background: #c96a2a; color: white; border: none; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }
.send-btn { background: #c96a2a; color: white; border: none; width: 30px; height: 30px; border-radius: 7px; font-size: 14px; cursor: pointer; }
</style>
</head>
<body>
<div class="chat-area" id="chatArea">
  <div class="message ai">
    <span class="label">Linux Buddy</span>
    <div class="bubble">Hello! Tell me your Linux goal — I will guide you step by step.</div>
  </div>
</div>
<div class="input-area">
  <textarea id="userInput" placeholder="Describe your problem..." rows="3"></textarea>
  <div class="buttons">
    <button class="start-btn" onclick="startSession()">Start Session ↗️</button>
    <button class="send-btn" onclick="sendMessage()">↑</button>
  </div>
</div>
<script>
const vscode = acquireVsCodeApi();

function sendMessage() {
  var input = document.getElementById('userInput');
  var text = input.value.trim();
  if (!text) return;
  addMessage('user', text);
  input.value = '';
  vscode.postMessage({ command: 'chat', text: text });
}

function startSession() {
  vscode.postMessage({ command: 'start' });
}

function addMessage(role, text) {
  var chatArea = document.getElementById('chatArea');
  var div = document.createElement('div');
  div.className = 'message ' + role;
  var label = role === 'ai' ? '<span class="label">Linux Buddy</span>' : '';
  div.innerHTML = label + '<div class="bubble">' + text + '</div>';
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

window.addEventListener('message', function(event) {
  addMessage('ai', event.data.reply);
});

document.getElementById('userInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
</script>
</body>
</html>`;
    }
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map