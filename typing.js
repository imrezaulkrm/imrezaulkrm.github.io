const cmdLine = document.getElementById('cmd-line');
const resultBlock = document.getElementById('result-block');

const commands = [
  { cmd: 'kubectl get skill', result: 'Docker ✅  Kubernetes ✅  CI/CD ✅' },
  { cmd: 'docker ps -a', result: 'abcd1234  nginx  Up 2 hours' },
  { cmd: 'git status', result: 'On branch main nothing to commit' },
  { cmd: 'whoami', result: 'Md Rezaul Karim' },
  { cmd: 'terraform plan', result: 'No changes. Infrastructure up-to-date.' }
];

const typingSpeed = 50;
const pauseAfterCommand = 800;
const pauseAfterResult = 2000;

async function typeCommand(text) {
  cmdLine.textContent = '';
  for (let i = 0; i < text.length; i++) {
    cmdLine.textContent += text.charAt(i);
    await new Promise(r => setTimeout(r, typingSpeed));
  }
}

async function showResult(result) {
  resultBlock.innerHTML = '';
  const lines = result.split('\n');
  lines.forEach(line => {
    const resLine = document.createElement('div');
    resLine.innerHTML = `<span class="prompt">imrezaulkrm:~$ </span>${line}`;
    resultBlock.appendChild(resLine);
  });
}

async function runTerminalLoop() {
  while (true) {
    const { cmd, result } = commands[Math.floor(Math.random() * commands.length)];

    await typeCommand(cmd);
    await new Promise(r => setTimeout(r, pauseAfterCommand));

    await showResult(result);
    await new Promise(r => setTimeout(r, pauseAfterResult));

    // clear for next loop
    cmdLine.textContent = '';
    resultBlock.innerHTML = '';
  }
}

runTerminalLoop();
