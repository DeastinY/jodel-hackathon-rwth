const http = require('https'),
  fs = require('fs'),
  URL = require('url'),
  mongoose = require('mongoose'),
  _config = `./config.json`,
  __baseurl,__baseurl3;
mongoose.Promise = global.Promise;
let c = 0;

const Jodel = mongoose.Schema({
  message: String,
  created_at: String,
  updated_at: String,
  pin_count: Number,
  color: String,
  thanks_count: Number,
  child_count: Number,
  replier: Number,
  post_id: String,
  vote_count: Number,
  share_count: Number,
  user_handle: String,
  distance: Number,
  location: String,
  is_reply: {type: Boolean, default: false},
  children: {type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Jodel'}], default:[]}
});

const App = class App {
  constructor(config) {
    this.client = null;
    this.config = config;
    this.config.interval = this.config.interval || 5000;

    __baseurl = config.apiv2;
    __baseurl3 = config.apiv3;
    mongoose.connect(config.db);
    this.db = mongoose.connection;
    const mod_Jodel = mongoose.model('Jodel', Jodel);
    this.run();
  }
  getURL(name, repl={}) {
    let url = `${this.config[name]}`;
    repl.V3 = __baseurl3;
    repl.V2 = __baseurl;
    for(const key in repl) {
      url = url.replace(`%${key}%`, repl[key]);
    }
    return url;
  }
  async run() {
    console.log(`running at ${60/(this.config.interval/1000)}RPM`);
    this._interval = setInterval(this.tick.bind(this), this.config.interval);
  }
  async tick() {
    console.log(`POLLING #${c++}`);
    let posts = await this.getPosts().catch(e=>console.error(e));
    if(!posts.posts) return console.error(`ERROR OCCURED: ${posts}`);
    console.log(`GOT ${posts.posts.length} POSTS`);
    let repliedTo = posts.posts.filter(p=>p.children).map(p=>p.post_id);
    for(const id of repliedTo) {
      let {replies} = await this.getPostDetails(id);
      posts.posts.filter(p=>p.post_id==id)[0].children = replies;
    }
    posts.posts.map(post=>{
      let replies = [];
      this.db.models.Jodel.findOne({post_id:post.post_id})
        .exec()
        .then(p=>{
          if(p) return;
          if(post.children&&post.children.length) {
            replies = post.children.map(child=>new this.db.models.Jodel({
              message: child.message,
              created_at: child.created_at,
              updated_at: child.updated_at,
              pin_count: child.pin_count,
              color: child.color,
              thanks_count: child.thanks_count,
              child_count: child.child_count,
              replier: child.replier,
              post_id: child.post_id,
              vote_count: child.vote_count,
              share_count: child.share_count,
              user_handle: child.user_handle,
              distance: child.distance,
              location: child.location.name,
              is_reply: true,
              children: []
            }));
          }
          let jodel = new this.db.models.Jodel({
            message: post.message,
            created_at: post.created_at,
            updated_at: post.updated_at,
            pin_count: post.pin_count,
            color: post.color,
            thanks_count: post.thanks_count,
            child_count: post.child_count,
            replier: post.replier,
            post_id: post.post_id,
            vote_count: post.vote_count,
            share_count: post.share_count,
            user_handle: post.user_handle,
            distance: post.distance,
            location: post.location.name,
            is_reply: false,
            children: replies
          });
          Promise.all(replies.map(r=>new Promise((resolve,reject)=>{
            r.save(_=>resolve());
          }))).then(_=>jodel.save()).catch(e=>console.error(e));
        });
      })
  }
  async getPostDetails(id) {
    console.log(`GET DETAILS FOR ${id}`)
    return this.fetch(this.getURL('detail',{ID:id})).catch(console.error);
  }
  async getPosts() {
    return this.fetch(this.getURL('list')).catch(console.error);
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
