#include <iostream>
using namespace std;

struct A
{
	virtual void foo() { cout << "A::foo\n"; }
};

struct B : public A
{
	virtual void foo() override { cout << "B::foo\n"; }
};

int main()
{
	void (A::*bar)() = &A::foo;
	A a;
	B b;
	(a.*bar)();
	(b.*bar)();
	A * p = &b;
	(p->*bar)();
	return 0;
}