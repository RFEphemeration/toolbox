#include <iostream>

struct Base
{
	int i;
};

struct Derived : public Base
{

};

template <typename T>
int GetBasedOnType(T* t) { return -1; }

template <>
int GetBasedOnType<Base>(Base* t) { return 0; }

template <>
int GetBasedOnType<Derived>(Derived* t) { return 1; }

int main(void)
{
	Base* test = new Derived();
	std::cout << GetBasedOnType(test) << std::endl;
	delete test;

	// prints 0
	// so templates complete based on variable type, not object type
	// this is what the visitor pattern compensates for
	// because c++ doesn't have double dynamic dispatch
}