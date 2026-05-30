import os
import requests
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

console = Console()

API_KEY = "KEY"
MODEL = "anthropic/claude-haiku-4-5"

def get_terminal_context():
    context = {}
    context["pwd"] = os.getcwd()
    context["user"] = os.environ.get("USER", "unknown")
    return context

def ask_claude(user_message, eyes_on, context):
    system = """You are Linux Buddy AI — a terminal assistant.
You help users learn Linux step by step.
NEVER give copy-paste commands — show commands clearly so user types themselves.
Always explain what each command does and why.
If there is an error, explain why it happened and give alternative."""

    if eyes_on:
        system += f"\n\nTerminal Context:\nDirectory: {context['pwd']}\nUser: {context['user']}"

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 500,
            "stream": False
        }
    )

    data = response.json()
    return data["choices"][0]["message"]["content"]

def main():
    eyes_on = False
    console.print(Panel("👁️  Linux Buddy AI", style="bold green"))
    console.print("[dim]Type your problem. 'eyes on' = AI sees terminal. 'quit' = exit.[/dim]\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except KeyboardInterrupt:
            console.print("\n[yellow]Goodbye![/yellow]")
            break

        if not user_input:
            continue

        if user_input.lower() == "quit":
            console.print("[yellow]Goodbye![/yellow]")
            break
        elif user_input.lower() == "eyes on":
            eyes_on = True
            console.print("[green]👁️  Eyes ON — AI can see your terminal[/green]\n")
            continue
        elif user_input.lower() == "eyes off":
            eyes_on = False
            console.print("[red]👁️  Eyes OFF[/red]\n")
            continue

        context = get_terminal_context() if eyes_on else {}

        with console.status("[bold green]Thinking...[/bold green]"):
            reply = ask_claude(user_input, eyes_on, context)

        console.print(Panel(reply, title="[bold blue]Linux Buddy[/bold blue]", style="blue"))
        print()

if __name__ == "__main__":
    main()
