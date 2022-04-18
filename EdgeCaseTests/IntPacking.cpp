#include<stdio.h>

int main(void)
{
	int match_with_buffer = 0;
	int match_without_buffer = 0;
	int total = 0;
	const unsigned int bit_count = 4;
	const unsigned int limit = 0b1111;
	for (unsigned int a1 = 0; a1 <= limit; a1++)
	{
		for (unsigned int a2 = 0; a2 <= limit; a2++)
		{
			for (unsigned int b1 = 0; b1 <= limit; b1++)
			{
				for (unsigned int b2 = 0; b2 <= limit; b2++)
				{
					unsigned int a_average = (a1 + a2) / 2;
					unsigned int b_average = (b1 + b2) / 2;

					total++;
					for (int buffer = 0; buffer < 2; buffer ++)
					{
						unsigned int packed_1 = (a1 << (bit_count + buffer)) + b1;
						unsigned int packed_2 = (a2 << (bit_count + buffer)) + b2;
						unsigned int packed_average = (packed_1 + packed_2) / 2;
						unsigned int unpacked_a = packed_average >> (bit_count + buffer);
						unsigned int unpacked_b = packed_average & limit;

						if (buffer == 0)
						{
							if (unpacked_a == a_average
								&& unpacked_b == b_average)
							{
								match_without_buffer++;
							}
						}
						else
						{
							if (unpacked_a == a_average
								&& unpacked_b == b_average)
							{
								match_with_buffer++;
							}
						}
					}
				}
			}
		}
	}

	printf("total: %d\n", total);
	printf("matches with buffer: %d\n", match_with_buffer);
	printf("matches without buffer: %d\n", match_with_buffer);
}

