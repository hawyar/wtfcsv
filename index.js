const { createInterface } = require("readline");
const { createReadStream } = require("fs");
const EE = require("events");

(function fnext(path) {
	const rl = createInterface({
		input: createReadStream(path),
		crlfDelay: Infinity,
	});

	const emitter = new EE();

	let count = 0;

	function split(chunk, sep) {
		console.log(chunk.split(sep).filter((x) => x !== ""));
	}

	function* transformer(line, sep) {
		yield split(line, sep);
		yield emitter.emit("got", line);
	}

	rl.on("line", (l) => {
		let gen = transformer(l, " ");
		// go thru transformer funcs
		for (let value of gen);
	}).on("close", () => {
		rl.close();
	});

	emitter.on("got", (line) => {
		count++;
	});
})(process.argv.length === 2 ? "./package.json" : process.argv[2]);
