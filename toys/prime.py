
# sieve of eratosthenes
root_count = 120

count = root_count * root_count

prime = [True for x in range(count)]

prime[0] = False
prime[1] = False

for r in range(2,root_count + 1):
	if not prime[r]:
		continue
	n = r + r
	while n < count:
		prime[n] = False
		n += r

for p in range(count - 1, 0, -1):
	if prime[p]:
		print p
		break