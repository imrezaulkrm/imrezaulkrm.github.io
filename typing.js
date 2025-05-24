const cmdLine = document.getElementById('cmd-line');
const resultBlock = document.getElementById('result-block');

const commands = [
  { cmd: 'whoami', result: 'Md Rezaul Karim' },
  { cmd: 'cat ~/email.txt', result: 'rezaul1203karim@gmail.com' },
  { cmd: 'cat ~/phone.txt', result: '01871468781' },
  { cmd: 'kubectl get skills', result: 'Docker, Kubernetes, Jenkins, Git, GitHub, AWS, Ubuntu Server' },
  { cmd: 'docker ps -a', result: 'smart-home-box  Up 12 hrs | blood-donation-app  Up 1 day' },
  { cmd: 'ls ~/projects', result: 'pharmacy-system  maze-escape-game  digital-doc-generator' },
  { cmd: 'cat ~/current_job.txt', result: 'IT Department, Garments Industry' },
  { cmd: 'cat ~/goals.txt', result: 'Become a Pro DevOps Engineer, Master Kubernetes & AWS' },
  { cmd: 'crontab -l', result: '@daily 6AM: black cumin + honey + chia + learning DevOps' },
  { cmd: 'history | grep kubernetes', result: 'minikube start, ingress apply, service clusterIP, nodePort test' },
  { cmd: 'git log --author="rezaul"', result: 'feat: k8s ingress, fix: docker-compose, doc: setup guide' },
  { cmd: 'uptime', result: 'System active for 26+ years | Mode: Learning' },
  { cmd: 'echo $LIFESTYLE', result: 'Healthy, Focused, Budget Friendly' },
  { cmd: 'ping dream-job.com', result: 'Reply from future: DevOps role reachable' },
  { cmd: 'nmap localhost', result: 'Ports open: 22(ssh), 80(web), 443(secure), 3000(dev)' },
  { cmd: 'df -h ~/skills', result: 'Usage: 80% | Remaining: GoLang, Monitoring, Security' },
  { cmd: 'top -u rezaul', result: 'Focus: 90% Learning | 5% Practice | 5% Sleep' },
  { cmd: 'alias grow="learn && build && never_give_up"', result: 'Alias set successfully' },
  { cmd: 'cat /etc/motivation.txt', result: '"Consistency beats intensity. Keep going Rezaul."' }
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
