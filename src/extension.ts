import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const provider = new LinuxBuddyProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('linuxbuddy.chatView', provider)
    );
}

class LinuxBuddyProvider implements vscode.WebviewViewProvider {
    constructor(private readonly extensionUri: vscode.Uri) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
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
                } catch {
                    webviewView.webview.postMessage({ reply: 'Server nahi mila — pehle server chalao!' });
                }
            }
            if (message.command === 'start') {
                vscode.commands.executeCommand('workbench.action.terminal.new');
                setTimeout(() => {
                    vscode.window.activeTerminal?.sendText(
                        'source ~/linuxbuddy-env/bin/activate && export OPENROUTER_API_KEY="tumhari_key" && python3 ~/linuxbuddy/main.py'
                    );
                }, 1000);
            }
        });
    }

    getHTML(): string {
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

export function deactivate() {}