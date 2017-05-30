const natural = require('natural'),
  http = require('https'),
  fs = require('fs'),
  URL = require('url'),
  _config = `./config.json`,
  __baseurl = `https://api.go-tellm.com/api/v2`;

const App = class App {
  constructor(config) {
    this.client = null;
    this.config = config;
    this.getPosts().then(console.log)
  }
  async getPosts() {
    return this.fetch(`${__baseurl}/posts`).catch(console.error);
  }
  fetch(url, headers={}, method='GET') {
    url = URL.parse(url);
    let data = [];
    headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    return new Promise((resolve,reject)=>{
      http.request({
        protocol: url.protocol,
        host: url.hostname,
        method,
        path: url.path,
        port: 443,
        headers
      }, res=>{
        res.on('data', d=>data.push(d));
        res.on('end', _=>{
          data = data.map(d=>d.toString()).reduce((a,b)=>a+b);
          try {
            let json = JSON.parse(data);
            resolve(json);
          }catch(e){resolve(data);}
        });
      }).end()
    })
  }
}
const config = fs.existsSync(_config)?require(_config):{};
new App(config);
