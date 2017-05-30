const lda = require('lda');

module.exports = {
  topics: (data, ntopics=10, nterms=10)=>lda(data,ntopics,nterms)
};
