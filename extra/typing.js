const cmdLine = document.getElementById('cmd-line');
const resultBlock = document.getElementById('result-block');

const commands = [
  { cmd: 'whoami', result: 'Md Rezaul Karim' },
  { cmd: 'echo $username', result: 'imrezaulkrm' },
  { cmd: 'cat ~/email.txt', result: 'rezaul1203karim@gmail.com' },
  { cmd: 'cat ~/phone.txt', result: '01871468781' },
  { cmd: 'kubectl get skills', result: 'Docker Kubernetes Jenkins AWS Git' },
  { cmd: 'docker ps -a', result: 'bartadhara Up | bytelock Up' },
  { cmd: 'ls ~/projects', result: 'Bartadhara Studentify Bytelock' },
  { cmd: 'cat ~/job.txt', result: 'DevOps Engineer, Software Company' },
  { cmd: 'cat ~/goals.txt', result: 'Master K8s & AWS | Pro DevOps' },
  { cmd: 'crontab -l', result: '6AM: fuel body && boot brain' },
  { cmd: 'history | tail -n 1', result: 'helm upgrade --install prod-app' },
  { cmd: 'git log --oneline', result: 'init CI | add ingress | fix docker' },
  { cmd: 'uptime', result: '27y | Dev Mode | Active' },
  { cmd: 'echo $LIFE', result: 'Healthy Consistent Focused' },
  { cmd: 'ping dream-job.com', result: 'Reply: DevOps reachable' },
  { cmd: 'nmap 127.0.0.1', result: '22 ssh | 443 https | 3000 dev' },
  { cmd: 'df -h ~/skills', result: 'Used: 85% | Free: GoLang' },
  { cmd: 'top -u rezaul', result: 'Focus 90% | Rest 5%' },
  { cmd: 'alias grow', result: 'learn && build && never_give_up' },
  { cmd: 'cat ~/motivation.txt', result: 'Consistency > Motivation' }
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
