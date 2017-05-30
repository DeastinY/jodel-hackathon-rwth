#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
import csv
from tqdm import tqdm
import json
import logging
import argparse
from pathlib import Path
from nltk.tag.stanford import StanfordNERTagger
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

logging.basicConfig(level=logging.INFO)

FILE_DB = Path("../dump.csv")
PATH_OUT = Path("../output")
PATH_OUT.mkdir(exist_ok=True)
FILE_OUT = PATH_OUT / "out.json"


def extract():
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
    for post in tqdm(posts):
        post["tokens_ns"] = [p for p in word_tokenize(post["message"]) if not p in stopwords.words('german')]
        post["tokens_all"] = [p for p in word_tokenize(post["message"])]
    return  stopwords


def save(posts, *, name=FILE_OUT):
    FILE_OUT.write_text(json.dumps(posts, indent=4, ensure_ascii=False), encoding="utf-8")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--extract", action="store_true")
    parser.add_argument("--tokenize", action="store_true")
    parser.add_argument("--save", action="store_true")
    args = vars(parser.parse_args())

    if FILE_OUT.exists():
        posts = json.loads(FILE_OUT.read_text(encoding="utf-8"))
    else:
        logging.warning(f"Did not load file {FILE_OUT}. This could lead to errors !")

    if args['extract']:
        posts = extract()
    if args['tokenize']:
        tokenize(posts)
    if args['save']:
        save(posts)
