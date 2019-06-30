

#include <iostream>


enum class TestEnum
{
	Zero = 0,
	One,
	Two
};

int main(void)
{
	TestEnum e = TestEnum::Zero;
	std::cout << static_cast<int>(e) << std::endl;
	std::cout << &e << std::endl;
	void* v = static_cast<void*>(&e);
	std::cout << v << std::endl;
	unsigned char* c = static_cast<unsigned char*>(v);
	std::cout << (void *)c << std::endl;

	char* a = (char *) & e;
	e = TestEnum::One;
	char* b = "adlfasd";
	b = a;
	std::cout << (void *)b << std::endl;

}
