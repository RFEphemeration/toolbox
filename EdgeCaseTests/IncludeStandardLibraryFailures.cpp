#include "../../farb/src/core/BuiltinTypedefs.h"

#include <iostream>

template <typename A, typename B, typename U = std::less<>>
bool f(A a, B b, U u = U())
{
    return u(a, b);
}

int main()
{
	std::cout << f(20, 10) << std::endl;
	std::cout << f(5, 10) << std::endl;
}