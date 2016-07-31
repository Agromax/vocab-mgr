"""
This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
"""
import os
import io
import glob
import csv
import re
import json
import sys
import StringIO
import codecs
from lxml import etree
from unidecode import unidecode

# Read the dictionary
WORDS = set()


def read_file(filePath):
    """
    Reads all the rows of the given csv file and returns a matrix
    """
    rows = []
    try:
        # with io.open(filePath, encoding="ISO-8859-1", errors='ignore') as fd:
        text = unidecode(codecs.open(filePath, encoding='ISO-8859-1', errors='ignore').read())
        csvFile = csv.reader(StringIO.StringIO(text))
        for row in csvFile:  # read all the rows and append it to rows
            rows.append(map(lambda x: x.strip().lower(), row))
    except Exception as e:
        print(e)
    return rows


def get_value_attrs(val):
    global WORDS

    val = unicode(val, "ISO-8859-1", 'ignore')
    val = ' '.join(re.subn(r"[&@#!~$%\^*()\[\],.;:'\"{}|\\_=\-0-9/?+]+", "", val)[0].split())
    tokens = val.split()
    score = ''

    if val in WORDS:
        score = 'P' * len(tokens)

    if score == '':
        for t in tokens:
            if t in WORDS:
                score += 'P'
            else:
                score += 'A'

    return val, len(tokens), score


def join_by_normalize(l):
    r = []
    for li in l.split():
        r.append("{}{}".format(li[0].upper(), li[1:]))
    return "".join(r)


def make_tree(mat, begin_row=0, begin_col=0, parent=None):
    """
        WR: Edit at your own risk
    """
    r, c, nRows = begin_row, begin_col, len(mat)

    while r < nRows and c < len(mat[r]):  # For each row do the following
        if c > 0 and r > begin_row:  #
            if mat[r][c - 1] != '':
                return

        # print "r={}, c={}\n".format(r, c), len(mat), len(mat[r])
        cell = mat[r][c]
        if cell != '' and cell is not None:
            # val: 	contains the actual value of the term
            # toks: the no of tokens(words) in the value
            # scr: 	the dictionary check score, ie individual tokens
            # 		are present or absent in the English dictionary
            val, toks, scr = map(str, get_value_attrs(cell))
            if val != '':
                node = {
                    "text": val,
                    "nodes": []
                }
                # term = etree.Element(join_by_normalize(val), value=val)
                make_tree(mat, r, c + 1, node)
                parent["nodes"].append(node)
            # parent.append(term)
            else:
                print "Empty tag found"
        r += 1


def generate_vocab(rootPath):
    root = {
        "text": "Vocabulary",
        "nodes": []
    }
    for fp in glob.glob(rootPath):
        rs = read_file(fp)
        make_tree(rs, 0, 0, root)
    with open('output_unindented.json', 'w') as fd:
        fd.write(json.dumps(root))


def main(arg):
    root = {
        "text": "Vocabulary",
        "nodes": []
    }
    csvText = read_file(arg)
    make_tree(csvText, 0, 0, root)
    print json.dumps(root)


if __name__ == "__main__":
    # generate_vocab('E:\\Thesis Data\\Hortivoc\\*.csv')
    main(sys.argv[1])
    # root = etree.Element('vocabulary')
    # rs = read_file("E:\Thesis Data\Hortivoc\Agricultural engineering-1.csv")
    # make_tree(rs, 0, 0, root)
    # print etree.tostring(root, pretty_print=True)
