const natural = require('natural'),
  http = require('https'),
  fs = require('fs'),
  URL = require('url'),
  {topics} = require('./analytics/lda.js'),
  sentiment = require('germansentiment'),
  _config = `./config.json`,
  __baseurl = `https://api.go-tellm.com/api/v2`;

const App = class App {
  constructor(config) {
    this.client = null;
    this.config = config;
    this.score = null;
    /*this.getPosts().then(posts=>{
      console.log(posts.posts.length)
      console.log(topics(posts.posts.map(post=>post.message)))
    }).catch(e=>console.error(e))*/
    this.rateJSON().catch(console.error)
  }
  NERFilter(ner) {
    return isNaN(parseInt(ner[0])) && ner[0].length;
  }
  eliminateDupes(s) {
    let test = /(\w)\1{2,}/g;
    while(test.test(s)) s = s.replace(test, '$1$1');
    return s;
  }
  async extractTopics(data, numTopics, numKeywords) {
    console.log(`beginning topic extraction...`);
    let raw = data.filter(e=>!!e.NER.length).map(e=>e.NER.map(e=>e[0]).join(' ')).map(s=>s.toLowerCase()).map(this.eliminateDupes);
    fs.writeFileSync('raw.tmp', JSON.stringify(raw,null,2));
    let _topics = await topics(raw, numTopics, numKeywords);
    fs.writeFileSync(this.config.topics_json_out, JSON.stringify(_topics, null, 2));
    console.log(`written topics to ${this.config.topics_json_out}.`);
  }
  async rateJSON() {
    console.log(`beginning sentiment rating...`);
    let data = require(this.config.data_json);
    for(const post of data) {
      post.karma = parseInt(post.karma);
      post.NER = post.NER.filter(this.NERFilter);
      if(!post.NER.length) continue;
      let {tokenized,valence,confidence,assessments} = await this.rate(
        post.NER.map(e=>e[0]).join(' ')
      );
      post.sentiment = {
        valence, confidence
      };
    }
    fs.writeFileSync(this.config.data_json_out, JSON.stringify(data, null, 2));
    console.log(`written sentiment to ${this.config.data_json_out}.`);
    this.extractTopics(data, this.config.numTopics, this.config.numKeywords).catch(e=>console.error(`EXTRACT TOPICS ERROR`,e));
  }
  async rate(text) {
    if(!this.score) this.score = await this.sentimentalize(this.config.wordlist);
    return new Promise((resolve,reject)=>{
      this.score(text, (e, tokenized, valence, confidence, assessments)=>{
        if(e) return reject(e);
        resolve({tokenized,valence,confidence,assessments});
      });
    });
  }
  async sentimentalize(wordlist='sentiws') {
    return new Promise((resolve,reject)=>{
      sentiment({wordlist},(e,s)=>{
        if(e) return reject(e);
        resolve(s);
      })
    });
  }
}
const config = fs.existsSync(_config)?require(_config):{};
new App(config);
