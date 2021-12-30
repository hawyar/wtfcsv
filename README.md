## wtfcsv

> Detect the shape of CSV files based on [RFC 4180](https://datatracker.ietf.org/doc/html/rfc4180)

### Why?

With a lacking standard, the processing of raw CSV is delegated to the applicaitons level where they use heuristics and checks based on file extension formats to make the best guess. Often you have to supplement it with additional metadata such as header column, whether the values are between quotes, or if records span multiple lines to override the guess. This is an attempt to extract those metadata.

### Usage

Clone the repo and run `npm i <path_to_wtfcsv>` as you would for any other package.

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
	"warnings": {}
}
```
