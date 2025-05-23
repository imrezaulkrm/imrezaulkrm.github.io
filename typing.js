const cmdLine = document.getElementById('cmd-line');
const resultLine = document.getElementById('result-line');

const commands = [
  { cmd: 'kubectl get skill', result: 'Docker ✅  Kubernetes ✅  CI/CD ✅' },
  { cmd: 'docker ps -a', result: 'abcd1234  nginx  Up 2 hours' },
  { cmd: 'git status', result: 'On branch main nnothing to commit' },
  { cmd: 'whoami', result: 'Md Rezaul Karim' },
  { cmd: 'terraform plan', result: 'No changes. Infrastructure up-to-date.' }
];

const typingSpeed = 50;
const pauseAfterCommand = 1000;
const pauseAfterResult = 1800;

async function typeText(text, container) {
  for (let i = 0; i < text.length; i++) {
    container.textContent += text.charAt(i);
    await new Promise(r => setTimeout(r, typingSpeed));
  }
}

async function clearTerminal() {
  cmdLine.textContent = '';
  resultLine.textContent = '';
}

async function runTerminalLoop() {
  while (true) {
    const { cmd, result } = commands[Math.floor(Math.random() * commands.length)];
    await clearTerminal();
    await typeText('$ ' + cmd, cmdLine);
    await new Promise(r => setTimeout(r, pauseAfterCommand));
    await typeText(result, resultLine);
    await new Promise(r => setTimeout(r, pauseAfterResult));
  }
}

runTerminalLoop();
