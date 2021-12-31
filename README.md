## wtfcsv

> Detect the shape of CSV files

### Why?

With a lacking standard, the processing of raw delimited values is delegated to the applicaiton level where they use heuristics to make the best guess. Often you have to supplement it with additional metadata such as delimiter, header column, whether the values are between quotes, or if records span multiple lines. This is an attempt to extract those metadata based on the format in [RFC 4180](https://datatracker.ietf.org/doc/html/rfc4180)

### Usage

Clone the repo and run `npm i <path_to_wtfcsv>` to use it

```bash
wtfcsv <path_to_csv_file>
```

Output:

```json
{
	"type": "",
	"columns": [],
	"header": null,
	"encoding": "",
	"bom": "",
	"spanMultipleLines": null,
	"quotes": null,
	"delimeter": "",
	"errors": {},
	"warnings": {},
	"preview": []
}
```
