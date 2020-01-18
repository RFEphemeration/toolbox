#include <iostream>

struct Functor
{
	int operator()()
	{
		return 3;
	}

	operator int()
	{
		return (*this)();
	}
};


int main()
{
	Functor a;
	auto b = a;

	std::cout << b << std::endl; // console reads 3;
}