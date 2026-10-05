import random,sys
A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
def chk(s):
    a=7
    for c in s.replace('-',''): a=(a*31+ord(c))%len(A)
    return A[a]
def key():
    b='GF-'+''.join(random.choice(A) for _ in range(4))+'-'+''.join(random.choice(A) for _ in range(4))+'-'+''.join(random.choice(A) for _ in range(3))
    return b+chk(b)
for _ in range(int(sys.argv[1]) if len(sys.argv)>1 else 5): print(key())
