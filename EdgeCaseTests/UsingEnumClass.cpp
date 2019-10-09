enum class Example
{
	A,
	B,
	C
};

int main(void)
{
	Example a = Example::A;

	using class Example;

	a = B;
}