#include <iostream>

struct miles
{
	int value;

	miles(int value) : value(value) { }
	operator int () const { return value; }
};

struct kilometers
{
	int value;
	kilometers(int value) : value(value) { }
	operator int() const { return value; }
};

void func(kilomters distance)
{
	std::cout << distance.value << std::endl;
}

int main(void)
{
	miles m(10);

	kilometers k(m);

	std::cout << k.value << std::endl;

	// func(m); // does not compile
}