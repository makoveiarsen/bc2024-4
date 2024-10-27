const { program } = require('commander');
const http = require('http');

program
    .option('-h, --host <address>', 'Server address')
    .option('-p, --port <number>', 'Server port')
    .option('-c, --cache <path>', 'Path to directory with cache files');

program.parse();

const opts = program.opts();
if (!opts.host) {
    console.error('Error: input host');
    return;
} else if (!opts.port) {
    console.error('Error: input port');
    return;
} else if (!opts.cache) {
    console.error('Error: input cache');
    return;
}

const server = http.createServer((req, res) => {
    res.writeHead(200);
});

server.listen(opts.port, opts.host, () => {
    console.log(`Server is running on https://${opts.host}:${opts.port}`);
});