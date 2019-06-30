#include <iostream>
#include <type_traits>
#include <typeinfo>
#include <cxxabi.h>

struct TestPointer
{
	int member;
	TestPointer() : member(0) {	 }

	TestPointer& operator=(const TestPointer& other)
	{
		member = other.member;
		return *this;
	}

	TestPointer(const float& fMember) { member = (int) fMember; }

	void ReflectCopy(const TestPointer& other) { member = other.member; }
};

enum class ReflectionOptions
{
	Float = 0x1,
	Int = 0x10,
	UInt = 0x100,
};

struct TypeInformationInterface
{
	int reflectionOptionFlags;

	TypeInformationInterface(int flags) : reflectionOptionFlags(flags) { }

	bool ReflectsWithFloat()
	{
		return reflectionOptionFlags & (int) ReflectionOptions::Float;
	}

	virtual void FloatReflect(void* obj, const float& f) { };
};

template<typename T>
struct TypeInformation : public TypeInformationInterface
{

	TypeInformation()
		: TypeInformationInterface((int) ReflectionOptions::Float)
	{
	}

	virtual void FloatReflect(void* obj, const float& f) override
	{
		T* t = (T*) obj;
		if (t != nullptr)
		{
			*t = f;
		}
	};
};

template<typename T1, typename T2>
void ReflectAssign(T1& object, const T2& other) { object = other; }


// https://stackoverflow.com/questions/81870
template<typename T>
void PrintTypeName(const T& value)
{
	std::unique_ptr<char, void(*)(void*)> own(
		abi::__cxa_demangle(
			typeid(value).name(),
			nullptr,
			nullptr,
			nullptr
		),
		std::free
	);
	std::cout << own.get() << std::endl;
}

int main(void)
{
	TestPointer test;
	std::cout << test.member << std::endl;

	TestPointer test1(1.0f);
	auto copy = &TestPointer::ReflectCopy;

	// this doesn't work because pointer still has type information in it
	PrintTypeName(copy);
	(test.*copy)(test1);
	std::cout << test.member << std::endl;
	(test.*copy)(2.0f);
	std::cout << test.member << std::endl;

	// this also doesn't work for the same reason
	auto assign = &ReflectAssign<TestPointer, TestPointer>;
	PrintTypeName(assign);
	TestPointer test3(3.0f);
	assign(test, test3);
	std::cout << test.member << std::endl;
	assign(test, 4.0f);
	std::cout << test.member << std::endl;

	// this will require a type TypeInformation<T> for every T.
	// am I okay with this?
	// Might as well use one of the above strategies if we're going to
	// have a type parameter anyways
	TypeInformationInterface* type = new TypeInformation<TestPointer>();
	type->FloatReflect(&test, 5.0f);
	std::cout << type->ReflectsWithFloat() << std::endl;
	std::cout << test.member << std::endl;

}