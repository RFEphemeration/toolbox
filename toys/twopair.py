import random
from collections import Counter
from sortedcontainers import SortedList
from pprint import pprint, pformat

class DeckSimulation:
	def __init__(self, starting_pair_count, discard_counts):
		self.starting_pair_count = starting_pair_count
		self.discard_counts = discard_counts

	def reset(self):
		self.deck = list(range(1, 14)) * 4
		random.shuffle(self.deck)
		
		self.hand = []
		self.rank_counts = Counter()
		self.deck_count = Counter(self.deck)
		self.deck_sorted = SortedList(self.deck_count.keys(), key=lambda r: self.deck_count[r])

	def draw(self):
		if not self.deck:
			return
		card = self.deck.pop(0)
		self.rank_counts[card] += 1
		self.deck_sorted.remove(card)
		self.deck_count[card] -= 1
		self.deck_sorted.add(card)
		self.hand.append(card)

	def discard(self, rank):
		if rank not in self.rank_counts or self.rank_counts[rank] == 0:
			raise ValueError(f"No {rank} in hand to discard.")

		self.rank_counts[rank] -= 1
		self.hand.remove(rank)

	def choose_and_discard(self, discard_count):
		# discard ranks with count > 2, reduce to 2
		discarded = 0
		for rank, count in list(self.rank_counts.items()):
			while count > 2 and discarded < discard_count:
				self.discard(rank)
				count -= 1
				discarded += 1

		if discarded < discard_count:
			# discard ranks with the lowest deck count
			for rank in self.deck_sorted:
				if self.rank_counts[rank] == 1 and discarded < discard_count:
					self.discard(rank)
					discarded += 1

		return discarded

	def has_two_pair(self):
		foundOne = False
		for rank, count in self.rank_counts.items():
			if count >= 2:
				if foundOne:
					return True
				foundOne = True
		return False

	def pair_count(self):
		foundOne = False
		for rank, count in self.rank_counts.items():
			if count >= 2:
				if foundOne:
					return 2
				foundOne = True
		if foundOne:
			return 1
		return 0

	def draw_until_two_pair(self):
		first = True
		while(first or self.pair_count() != self.starting_pair_count):
			first = False
			self.reset()
			for i in range(8):
				self.draw()

		cycle_count = 0
		while (self.deck and not self.has_two_pair()):
			discard_count = self.discard_counts[cycle_count] if cycle_count < len(self.discard_counts) else self.discard_counts[-1]
			cycle_count += 1
			discarded = self.choose_and_discard(discard_count)
			#print(f"discarded: {discarded}, remaining: {len(self.deck)}, hand: {len(self.hand)}")
			if discarded == 0:
				return -1
			for i in range(discarded):
				self.draw()
		if not self.has_two_pair():
			return -1
		return cycle_count

	def simulate(self, count):
		cycle_counter = Counter()
		for cycle in range(count):
			cycle_count = self.draw_until_two_pair()
			cycle_counter[cycle_count] += 1
			#print(f"cycles: {cycle_count}")
		return cycle_counter

starting_pair_counts = [
	#0,
	1,
]

discard_patterns = [
	[5],
	#[5, 5, 5, 4],
	[5, 5, 4],
	#[5, 5, 4, 4, 3],
	#[5, 4],
	#[4],
]

simulation_count = 500000

def cumulative_counts(counter, total):
	result = {}
	cumulative = 0
	for k in sorted(counter):
		cumulative += counter[k]
		result[k] = {
			'discard': k,
			'cumulative': cumulative,
			'made': counter[k],
			'missed': total - cumulative,
			'ratio': counter[k] / max(counter[k] + total-cumulative, 1),
		}
	return result

for pair_count in starting_pair_counts:
	pprint(pair_count)
	for discard_pattern in discard_patterns:
		pprint(discard_pattern)
		simulation = DeckSimulation(pair_count, discard_pattern)
		cycle_counter = simulation.simulate(simulation_count)
		comparison = cumulative_counts(cycle_counter, simulation_count)
		for rank in comparison:
			print(pformat(comparison[rank], width=1_000_000))
