#!/usr/bin/env node

const { createInterface } = require("readline");
const { createReadStream, existsSync } = require("fs");
const { spawn } = require("child_process");
const os = require("os");
const { Buffer } = require("buffer");

const usage = `Usage: \n \t wtfcsv <path_to_csv_file>`;
const delimiters = [",", ";", "|", ":", "\t"];

(function wtfcsv(path) {
	if (path === undefined || path === "") {
		writeout(usage);
		return;
	}

	let shape = {
		type: "",
		columns: [],
		header: null,
		encoding: "",
		bom: "",
		spanMultipleLines: null,
		quotes: null,
		delimeter: "",
		errors: {},
		warnings: {},
		preview: [],
	};

	if (!existsSync(path)) {
		writeout(`${path} does not exist, provide a valid path to a CSV file`);
		process.exit(1);
	}

	let platform = os.platform();

	if (
		platform === "darwin" ||
		platform === "linux" ||
		platform === "freebsd" ||
		platform === "openbsd"
	) {
		const fileType = spawn("file", [path, "--mime-type"]);

		fileType.stdout.on("data", (data) => {
			const type = data.toString().split(":")[1].trim();

			if (type === "text/csv" || type === "text/plain") {
				shape.type = type;
				return;
			}

			shape.errors["incorrectType"] = `${path} is of type ${type}`;
			writeout(shape);
			prcoess.exit(0);
		});

		fileType.on("close", (code) => {
			if (code !== 0 || shape.type === "") {
				console.warn("unable to use file() cmd");
			}
		});
	}

	const rl = createInterface({
		input: createReadStream(path),
		crlfDelay: Infinity,
	});

	let count = 0;
	let max = 20;

	// to store the column header if it exists for further checks
	let first = {
		row: [],
		del: "",
	};

	// hold the previous line while rl proceeeds to next line using \r\n as a delimter
	let previous = "";

	rl.on("line", (current) => {
		if (count === 0) {
			delimiters.forEach((d) => {
				if (current.split(d).length > 1) {
					first.row = current.split(d);
					first.del = d;
				}
			});

			if (first.del === "" || first.row <= 1) {
				shape.errors["unrecognizedDelimeter"] =
					"unable to detect delimeter";

				shape.header = false;
				writeout(shape);
				process.exit(0);
			}

			const isDigit = /\d+/;

			// we are betting numbers should not appear as the header
			const hasDigitInHeader = first.row.some((el) => isDigit.test(el));

			if (hasDigitInHeader) {
				shape.header = false;
				shape.warnings["noHeader"] = `no header found`;
				count++;
				return;
			}

			shape.header = true;
			shape.delimeter = first.del;
			shape.columns = first.row;
		}

		if (count > 0 && count < max) {
			// if odd number of quotes on current line then there is a chance the record spans the next line
			const inlineQuotes = current.split(`"`).length - 1;

			if (previous) {
				if (inlineQuotes % 2 !== 0) {
					// TODO: make sure previous + current
					// console.log(previous + l);
					shape.spanMultipleLines = true;
				}
			}
			// check if odd number of quotes and consider escaped quotes such as: "aaa","b""bb","ccc"
			if (
				inlineQuotes % 2 !== 0 &&
				current.split(`""`).length - 1 !== 1
			) {
				previous = current;
			}

			let width = current.split(first.del).length;
			if (width !== first.row.length) {
				shape.errors[
					`mismatch row width, expected ${width}, got ${first.row.length}`
				];
				return;
			}
			shape.preview.push(current.split(first.del));
		}

		count++;
	});

	rl.on("close", () => {
		writeout(shape);
		rl.close();
		process.exit(0);
	});
})(process.argv.length === 2 ? noop() : process.argv[2]);

function noop() {}

function writeout(msg) {
	typeof msg === "string"
		? process.stdout.write(msg + "\n")
		: process.stdout.write(JSON.stringify(msg, null, 2) + "\n");
}
