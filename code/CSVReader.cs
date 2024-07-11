using System;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

public class CSVReader
{
    public struct Options
    {
        public char LineSeparator;
        public char ValueSeparator;

        public static Options Default => new Options()
        {
            LineSeparator = '\n',
            ValueSeparator = ',',
        };
    }

    // rmf note: this is a very basic parser, it doesn't handle quoted values
    // it expects the first row to be the header of keys used for object deserialization
    public static void ReadValues<T>(ReadOnlySpan<char> text, Action<T> add,  Options? options = null)
    {
        if (!options.HasValue)
        {
            options = Options.Default;
        }
        ReadOnlySpan<char> textRemaining = text;
        ReadOnlySpan<char> line = ConsumeUntil(ref textRemaining, options.Value.LineSeparator);
        List<string> keys = new List<string>();
        while (line.Length > 0)
        {
            keys.Add(ConsumeUntil(ref line, options.Value.ValueSeparator).ToString());
        }
        while (textRemaining.Length > 0)
        {
            JObject obj = new JObject();
            line = ConsumeUntil(ref textRemaining, options.Value.LineSeparator);
            for (int i = 0; line.Length > 0 && i < keys.Count; i++)
            {
                ReadOnlySpan<char> value = ConsumeUntil(ref line, options.Value.ValueSeparator);
                obj.Add(keys[i], value.ToString());
            }
            add(obj.ToObject<T>());
        }
    }

    private static ReadOnlySpan<char> ConsumeUntil(ref ReadOnlySpan<char> source, char seperator)
    {
        int end = source.IndexOf(seperator);
        if (end == -1)
        {
            ReadOnlySpan<char> slice = source;
            source = new ReadOnlySpan<char>();
            return slice;
        }
        else
        {
            ReadOnlySpan<char> slice = source.Slice(0, end);
            source = source.Slice(end + 1);
            return slice;
        }
    }
}