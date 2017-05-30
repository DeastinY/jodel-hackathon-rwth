const natural = require('natural'),
  http = require('https'),
  fs = require('fs'),
  URL = require('url'),
  _config = `./config.json`;

const App = class App {
  constructor(...c) {
    this.client = null;
    this.init(...c);
  }
  fetch(url, headers, method='GET') {
    url = URL.parse(url);
    let data = [];
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
          try {
            data = JSON.parse(data.map(d=>d.toString()).reduce((a,b)=>a+b));
            resolve(data);
          }catch(e){reject(e);}
        });
      }).end()
    })
  }
  async init(config) {
    let posts = await this.fetch(`https://api.go-tellm.com/api/v2/posts`, {
      Authorization: `Bearer ${config.accessToken}`
    }).catch(console.error);
    console.log(posts)
  }
}
const config = fs.existsSync(_config)?require(_config):{};
new App(config);
