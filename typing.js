const cmdLine = document.getElementById('cmd-line');
const resultBlock = document.getElementById('result-block');

const commands = [
  { cmd: 'kubectl get skill', result: 'Docker  Kubernetes  Jenkins  AWS  Git  CI/CD' },
  { cmd: 'docker ps -a', result: 'c0ffee42  devops_life  Up 24/7' },
  { cmd: 'git status', result: 'On branch main → working clean, committed to excellence' },
  { cmd: 'whoami', result: 'Md Rezaul Karim' },
  { cmd: 'terraform plan', result: '0 to add, 0 to change, 0 to destroy — everything is stable!' },
  { cmd: 'echo $FOCUS', result: 'DevOps | Cloud | Automation | Problem Solving' },
  { cmd: 'top -u rezaul', result: 'CPU: 90% learning, 10% execution' },
  { cmd: 'sudo apt install passion', result: 'Already installed and up-to-date' },
  { cmd: 'ping future', result: 'future is alive (latency=0ms)' },
  { cmd: 'curl ifconfig.me/goal', result: 'Become a Pro DevOps Engineer' },
  { cmd: 'ls ~/projects', result: 'smart-home  ci-cd-pipeline  k8s-lab  blood-donation-app' },
  { cmd: 'uptime', result: 'System running: 26 years | Status: Healthy' },
  { cmd: 'crontab -l', result: '@daily learn && build && grow' },
  { cmd: 'alias success="consistency && focus && patience"', result: 'Success command ready!' },
  { cmd: 'nmap localhost', result: 'Open ports: 80 (nginx), 443 (https), 22 (ssh), 3000 (dev)' },
  { cmd: 'cat /etc/rezaul/vision.txt', result: 'Build impactful solutions with elegance & efficiency' },
  { cmd: 'watch -n 86400 "echo Keep going Rezaul!"', result: 'Reminder scheduled: daily motivation running' },
  { cmd: 'history | grep success', result: '100+ matched results found' },
  { cmd: 'netstat -tuln | grep active', result: 'Listening on opportunities...' }
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
