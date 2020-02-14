const fs = require('fs');

const readFile = file => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
};

const writeFile = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

const addGuest = guest => {
  return readFile('./guests.json')
    .then(data => {
      const guests = JSON.parse(data);
      let max = guests.reduce((acc, guest) => {
        if (guest.id > acc) {
          acc = guest.id;
        }
        return acc;
      }, 0);
      guest.id = max + 1;
      guests.push(guest);
      return writeFile('./guests.json', JSON.stringify(guests, null, 2));
    })
    .then(() => {
      return guest;
    });
};
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/api/guests' && req.method === 'POST') {
    let buffer = '';
    req.on('data', chunk => {
      buffer += chunk;
    });
    req.on('end', () => {
      addGuest(JSON.parse(buffer))
        .then(guest => {
          console.log(guest);
          res.write(JSON.stringify(guest));
          res.end();
        })
        .catch(ex => {
          res.statusCode = 500;
          res.write(ex.message);
          res.end();
        });
    });
  }
  if (req.url === '/api/guests' && req.method === 'GET') {
    readFile('guests.json').then(guests => {
      res.write(guests);
      res.end();
    });
  }
  if (req.url === '/') {
    readFile('index.html').then(html => {
      res.write(html);
      res.end();
    });
  }
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
