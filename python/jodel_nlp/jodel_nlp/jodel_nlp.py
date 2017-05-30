#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
import csv
from tqdm import tqdm
import json
import logging
import argparse
from pathlib import Path
from nltk.tag.stanford import StanfordNERTagger
from nltk.tokenize import RegexpTokenizer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

logging.basicConfig(level=logging.DEBUG)

FILE_DB = Path("../dump.csv")
PATH_OUT = Path("../output")
PATH_OUT.mkdir(exist_ok=True)
FILE_OUT = PATH_OUT / "out.json"


def extract():
    logging.info("Extracting CSV file")
    posts = []
    with FILE_DB.open() as fin:
        header = None
        for row in tqdm(csv.reader(fin)):
            if not header:
                header = row
                continue
            dict_entry = {}
            for i, h in enumerate(header):
                dict_entry[h] = row[i]
            posts.append(dict_entry)
    return posts


def tokenize(posts):
    logging.info("Tokenizing")
    tokenizer = RegexpTokenizer(r'\w+')
    for post in tqdm(posts):
        tokens = tokenizer.tokenize(" ".join(word_tokenize(post["message"], language="german")))
        post["tokens_ns"] = [p for p in tokens if not p.lower() in stopwords.words('german')]
        post["tokens_ns_lower"] = [p.lower() for p in post["tokens_ns"]]
        post["tokens_all"] = [p for p in word_tokenize(post["message"])]
    return posts


def ner(posts):
    logging.info("NER Tagging")
    logging.info("Extracting NER")
    ner_tagger = StanfordNERTagger(model_filename="/home/ric/stanford/models/ner/german.conll.hgc_175m_600.crf.ser.gz")
    all_ne = set()
    all_messages = [p["tokens_ns"] for p in posts]
    for i, tag in enumerate(ner_tagger.tag_sents(all_messages)):
        posts[i]["NER"] = tag
        for n in tag:
            all_ne.add(n)
    all_ne = list(all_ne)
    logging.info(f"Found {len(all_ne)} unique entities.")
    return posts, list(all_ne)


def save(posts, *, name=FILE_OUT):
    logging.info(f"Saving to {FILE_OUT}")
    FILE_OUT.write_text(json.dumps(posts, indent=4, ensure_ascii=False), encoding="utf-8")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--extract", action="store_true")
    parser.add_argument("--tokenize", action="store_true")
    parser.add_argument("--save", action="store_true")
    parser.add_argument("--ner", action="store_true")
    args = vars(parser.parse_args())

    if FILE_OUT.exists():
        posts = json.loads(FILE_OUT.read_text(encoding="utf-8"))
    else:
        posts = []
        logging.warning(f"Did not load file {FILE_OUT}. This could lead to errors !")

    if args['extract']:
        posts = extract()
    if args['tokenize']:
        posts = tokenize(posts)
    if args['ner']:
        posts = ner(posts)
    if args['save']:
        save(posts)
