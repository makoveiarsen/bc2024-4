const { program } = require('commander');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const superagent = require('superagent');

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

const server = http.createServer(async (req, res) => {
    const code = req.url.slice(1);
    const filePath = path.join(opts.cache, `${code}.jpg`);
    console.log(filePath)
    if (req.method === 'GET') {
      try {
        const fileData = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(fileData);
      } catch (error) {
        if (error.code === 'ENOENT') {
          try {
            const catResponse = await superagent.get(`https://http.cat/${code}`);
            const imageBuffer = catResponse.body;
            await fs.writeFile(filePath, imageBuffer);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end("imageBuffer");
          } catch (catError) {
            console.log(catError)
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
          }
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        }
      }
    } else if (req.method === 'PUT') {
      let data = [];
      req.on('data', chunk => {
        data.push(chunk);
      });
      req.on('end', async () => {
        const buffer = Buffer.concat(data);
        try {
          await fs.writeFile(filePath, buffer);
          res.writeHead(201, { 'Content-Type': 'text/plain' });
          res.end('File created/updated');
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        }
      });
    } else if (req.method === 'DELETE') {
      try {
        await fs.unlink(filePath);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('File deleted');
      } catch (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        }
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method not allowed');
    }
  });
    
server.listen(opts.port, opts.host, () => {
    console.log(`Server is running on http://${opts.host}:${opts.port}`);
});