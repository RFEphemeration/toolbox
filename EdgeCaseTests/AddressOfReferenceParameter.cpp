
#include <iostream>

void f(int& i)
{
	std::cout << "location: " << &i << ", value: " << i << std::endl;
}

int main(void)
{
	int i = 10;
	std::cout << "location: " << &i << ", value: " << i << std::endl;
	f(i);
}
