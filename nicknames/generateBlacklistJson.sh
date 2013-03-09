#!/bin/bash

cd $(dirname $0)

nicknames_dir=$(pwd)
nicknames_blacklist=$nicknames_dir/nickname-blacklist
nicknames_blacklist_json=$nicknames_dir/../server/definitions/nicknamesBlacklist.json

function permute () {
    while read line; do
        lower_case=$(echo $line | tr '[A-Z]' '[a-z]')
        num_words=$(echo $lower_case | wc -w)

        if [ $num_words -le 1 ]; then
            echo $lower_case
        else
            for word in $lower_case; do
                echo $lower_case | sed -e "s/$word//" | permute | sed -e "s/^/$word/"
            done
        fi
    done | sed -e 's/ //g'
}

(
echo '['
cat $nicknames_blacklist | \
    grep -v '^#' | \
    grep -v '^$' | \
    permute | \
    sort -u | \
    grep -v '^$' | \
    sed -e 's/^.*$/"&"/' -e 's/$/,/'
echo ']'
) | tr -s '\n' ' ' | sed -e 's/, \]/ ]/' -e 's/ /\n/g' > $nicknames_blacklist_json

