#!/usr/bin/env python
"""
Masked wordcloud
================
Using a mask you can generate wordclouds in arbitrary shapes.
"""

from os import path
import random
import io
from PIL import Image
import string
import json
import numpy as np

from wordcloud import WordCloud

d = path.dirname(__file__)

# Read the whole text.
text = json.loads(io.open(path.join(d, 'jodel.json')).read())

# read the mask image
# taken from
# http://www.stencilry.org/stencils/movies/alice%20in%20wonderland/255fk.jpg
mask_jodel = np.array(Image.open(path.join(d, "racoon_large.jpg")))
#mask_jodel = np.array(Image.open(path.join(d, "alice.png")))

normal_word = r"(?:\w[\w']+)"
ascii_art = r"(?:[{punctuation}][{punctuation}]+)".format(punctuation=string.punctuation)
emoji = r"(?:[^\s])(?<![\w{ascii_printable}])".format(ascii_printable=string.printable)
regexp = r"{normal_word}|{ascii_art}|{emoji}".format(normal_word=normal_word, ascii_art=ascii_art,
         emoji=emoji)

def cf(word, font_size, position, orientation, random_state=None, **kwargs):
    return f"hsl({36+random.randint(-10,10)}, 100%, 50%)"

font_path = path.join(d, 'fonts', 'ose', 'ose.ttf')
wc = WordCloud(regexp=regexp, font_path=font_path, background_color="white", max_words=700, mask=mask_jodel, width=4000, height=4000, stopwords=None, relative_scaling=1, collocations = False, color_func=cf)
# generate word cloud
wc.generate_from_frequencies(text)

# store to file
wc.to_file(path.join(d,"wcjodel.png"))
