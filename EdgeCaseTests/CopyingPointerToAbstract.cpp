#include <iostream>

struct Base
{
	virtual bool operator()() = 0;
};

struct Derived : public Base
{
	virtual bool operator()() override
	{
		return true;
	}
};

int main(void)
{
	Base * b = new Derived();

	Base * b2 = new Base(*b);

	std::cout << (*b)() << std::endl;

	std::cout << (*b2)() << std::endl;

}