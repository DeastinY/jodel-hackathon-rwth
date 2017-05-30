#!/usr/bin/python3.6
# -*- coding: utf-8 -*-
import argparse
from pathlib import Path
from nltk.tag.stanford import StanfordNERTagger, StanfordPOSTagger
from nltk.tokenize import sent_tokenize, word_tokenize

FILE_DB = Path("DB.sqlite")

def extract():
    pass


def tokenize():
    pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--extract", action="store_true")
    args = vars(parser.parse_args())

