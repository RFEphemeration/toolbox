// g++ --std=c++17 ValuePtrAbstractBase.cpp && ./a.out

#include <iostream>

#include "../../farb/lib/value_ptr/value_ptr.hpp"

struct Base
{
	int i;

	virtual Base* clone() const = 0;

	virtual void DoSomething() = 0;

	virtual ~Base() = default;
};

struct Derived : Base
{
	char c;

	virtual Base* clone() const override
	{
		return new Derived(*this);
	}

	virtual void DoSomething() override
	{
		std::cout << "derived " << c << i << std::endl;
	}
};

struct Holder
{
	smart_ptr::value_ptr<Base> p;
};

int main(void)
{

	smart_ptr::value_ptr<Base> p{(Base *) new Derived()};
	p->i = 2;
	p->DoSomething();


	smart_ptr::value_ptr<Base> p2 = p;
	p2->DoSomething();
	
	
	Holder h;
	h.p = smart_ptr::value_ptr<Base>((Base*)new Derived());
	Holder h2 = h;
	h2.p->DoSomething();

	return 0;
}
