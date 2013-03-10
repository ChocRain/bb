#!/bin/bash

cd $(dirname $0)

avatars_dir=$(pwd)
row_dir=$avatars_dir/rows

out_map=$avatars_dir/../htdocs/img/sprites/avatars.png
out_json=$avatars_dir/../shared/definitions/avatars.json

function getNumFrames() {
    identify -format "%[scenes] " $1 | cut -d ' ' -f 1
}

function getSize() {
    identify -format "%w %h:" $1 | cut -d ':' -f 1 
}

function getFrameDelay() {
    expr $(identify -format "%T " $1 | cut -d ' ' -f 1) '*' 10
}

function toRow() {
    tile_width=$1
    tile_height=$2

    gif=$3
    png=$row_dir/$(basename $(echo $gif | sed -e 's/\.gif/\.png/'))

    montage \
        -tile 'x1' \
        -geometry '1x1+0+0<' \
        -alpha on \
        -background 'rgba(0,0,0,0.0)' \
        -quality 100 \
        -extent "${tile_width}x${tile_height}" \
        -gravity center \
        $gif \
        $png
}

function toMap () {
    montage \
        -tile '1x' \
        -alpha on \
        -background 'rgba(0,0,0,0.0)' \
        -quality 100 \
        -mode concatenate \
        $row_dir/*.png \
        $out_map
}

rm -rf $out_map $out_json $row_dir

mkdir -p $row_dir $(dirname $out_map) $(dirname $out_json)

(
echo "{"

# get max dimensions
max_width=0
max_height=0

for f in $avatars_dir/*.gif; do
    size=$(getSize $f)
    width=$(echo $size | cut -d ' ' -f 1)
    height=$(echo $size | cut -d ' ' -f 2)

    if [ $width -gt $max_width ]; then
        max_width=$width
    fi

    if [ $height -gt $max_height ]; then
        max_height=$height
    fi
done

echo "    \"tileWidth\": $max_width,"
echo "    \"tileHeight\": $max_height,"

# create rows
echo "    \"sprites\": {"
row=0
max_frames=0

for f in $avatars_dir/*.gif; do
    if [ $row -gt 0 ]; then
        echo ","
    fi

    name=$(basename $f | sed -e 's/\.gif$//')
    frames=$(getNumFrames $f)
    frame_delay=$(getFrameDelay $f)
    size=$(getSize $f)
    width=$(echo $size | cut -d ' ' -f 1)
    height=$(echo $size | cut -d ' ' -f 2)

    echo "        \"$name\": {"
    echo "            \"row\": $row,"
    echo "            \"width\": $width,"
    echo "            \"height\": $height,"
    echo "            \"frames\": $frames",
    echo "            \"frameDelay\": $frame_delay"
    echo -n "        }"

    toRow $max_width $max_height $f

    if [ $frames -gt $max_frames ]; then
        max_frames=$frames
    fi

    row=$(expr $row + 1)
done

echo
echo "    },"

echo "    \"rows\": $row,"
echo "    \"maxFrames\": $max_frames"

echo "}"

# create map
toMap

) > $out_json

rm -rf $row_dir

