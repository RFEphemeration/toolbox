from enum import Enum


class ImpossibleBoardState(Exception):
	pass

class Square:
	def __init__(self, grid, c, r):
		self.grid = grid
		self.c = c
		self.r = r
		self.possible_values = {0, 1, 2, 3}
		self.known_value = None
		
	def mark_impossible(self, value):
		if value not in self.possible_values:
			return
		self.possible_values.discard(value)
		count = len(self.possible_values);
		if (count == 0):
			raise ImpossibleBoardState
		if (count == 1):
			for v in self.possible_values:
				self.known_value = v
				break
			self.grid.notify_known(self.c, self.r)

	def mark_known(self, value):
		if self.known_value is not None:
			return
		self.known_value = value
		self.possible_values = {value}
		self.grid.notify_known(self.c, self.r, self.known_value)

	def print_possible(self, value):
		if self.known_value is not None:
			print(str(self.known_value), end=" ")
		elif value in self.possible_values:
			print(str(value), end=" ")
		else:
			print(" ", end=" ")

	def print_row_one(self):
		print(" ", end="")
		self.print_possible(0)
		self.print_possible(1)

	def print_row_two(self):
		print(" ", end="")
		self.print_possible(2)
		self.print_possible(3)


class Direction(Enum):
	Row = 0
	Column = 1

class Hint:
	def __init__(self, grid, direction, index, size, points, zeroes):
		self.grid = grid
		self.direction = direction
		self.index = index
		self.size = size
		self.points = points
		self.zeroes = zeroes
		self.missing_points = self.points + self.zeroes - self.size

class Grid:
	def __init__(self, column_hints, row_hints):
		self.height = len(row_hints)
		self.width = len(column_hints)
		self.squares = [[Square(self, c, r) for c in range(self.width)] for r in range(self.height)]
		self.column_hints = [
			Hint(self, Direction.Column, index, self.height, hint[0], hint[1])
			for index, hint in enumerate(column_hints)
		]
		self.row_hints = [
			Hint(self, Direction.Row, index, self.width, hint[0], hint[1])
			for index, hint in enumerate(row_hints)
		]

	def print(self):
		square_print_size = 6
		print("-"*(self.width*square_print_size+1))
		for r, row in enumerate(self.squares):
			for c, square in enumerate(row):
				print("|", end="")
				square.print_row_one()
			print(f"| {self.row_hints[r].points}")
			for square in row:
				print("|", end="")
				square.print_row_two()
			print(f"| x{self.row_hints[r].zeroes}")
			print("-"*(self.width*square_print_size+1))
		print("  ", end="")
		for hint in self.column_hints:
			print(str(hint.points).ljust(square_print_size, " "), end="")
		print("")
		print("  ", end="")
		for hint in self.column_hints:
			print("x" + str(hint.zeroes).ljust(square_print_size-1, " "), end="")
		print("")

	def prompt_values(self, prompt):
		return [int(s) for s in input(prompt).split(" ") if s != ""]

	def solve_until_ambiguous(self):
		for r, hint in enumerate(self.row_hints):
			if hint.missing_points == 0:
				for square in self.squares[r]:
					square.mark_impossible(2)
					square.mark_impossible(3)
			if hint.missing_points == 1:
				for square in self.squares[r]:\
					square.mark_impossible(3)
			elif hint.zeroes == 0:
				values = self.prompt_values(f"row {r} values: ")
				for pair in zip(range(self.width), values):
					self.squares[r][pair[0]].mark_known(pair[1])
		for c, hint in enumerate(self.column_hints):
			if hint.missing_points == 0:
				for row in self.squares:
					row[c].mark_impossible(2)
					row[c].mark_impossible(3)
			if hint.missing_points == 1:
				for row in self.squares:
					row[c].mark_impossible(3)
			elif hint.zeroes == 0:
				values = self.prompt_values(f"column {c} values: ")
				for pair in zip(range(self.height), values):
					self.squares[pair[0]][c].mark_known(pair[1])

		self.print()

	def notify_known(self, c, r, value):
		if value > 1:
			self.row_hints[r].missing_points -= value - 1;
		pass


def make_grid(hint_string):
	hints = hint_string.split('\n')
	row_hints = []
	column_hints = []
	while len(hints):
		hint = hints.pop(0)
		if hint == "":
			break
		row_hints.append([int(i) for i in hint.split(" ")])
	while len(hints):
		hint = hints.pop(0)
		if hint == "":
			break
		column_hints.append([int(i) for i in hint.split(" ")])
	grid = Grid(column_hints, row_hints)
	return grid

grid = make_grid("""7 0
6 1
4 2
3 3
4 2

3 2
5 2
5 1
5 1
6 2""")

grid.print()
grid.solve_until_ambiguous()
