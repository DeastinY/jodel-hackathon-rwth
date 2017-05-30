const data = require(`./tokenized.json`);
require('fs').writeFileSync('remapped.json',JSON.stringify(data.map(post=>{
  let _post = post;
  _post.vote_count = post.karma;
  delete _post.karma;
  for(const key in _post) {
    if(typeof _post[key]=='string') _post[key] = _post[key].toLowerCase();
    if(Array.isArray(_post[key])) _post[key] = _post[key].map(e=>e.toLowerCase());
  }
  return _post;
}),null,2));
