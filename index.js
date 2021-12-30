#!/usr/bin/env node

const { createInterface } = require("readline");
const { createReadStream, existsSync } = require("fs");
const { spawn } = require("child_process");
const os = require("os");

const usage = `Usage: \n \t wtfcsv <path_to_csv_file>`;
const delimiters = [",", ";", ":", "\t"];

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
	};

	if (!existsSync(path)) {
		writeout(`${path} does not exist, provide a valid path to a CSV file`);
		process.exit(1);
	}

	let platform = os.platform();

	if (
		platform === "darwin" ||
		platform === "linux" ||
		platform === "freebsd"
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

	rl.on("line", (l) => {
		if (count === 0) {
			delimiters.forEach((d) => {
				if (l.split(d).length > 1) {
					first.row = l.split(d);
					first.del = d;
				}
			});

			if (first.delimeter === "" || first.row <= 1) {
				shape.errors["unrecognizedDelimeter"] =
					"unable to detect delimeter";

				shape.header = false;
				writeout(shape);
				process.exit(0);
			}

			const isDigit = /\d+/;

			const hasDigitInHeader = first.row.some((el) => isDigit.test(el));

			// digits in column headers is odd
			if (hasDigitInHeader) {
				shape.header = false;
				shape.warnings["noHeader"] = `no header found`;
				count++;
				return;
			}

			shape.header = true;
			shape.delimeter = first.del;
			shape.columns = first.row;

			const lineQuotes = l.split(first.d).length - 1;
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
