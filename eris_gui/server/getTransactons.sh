#!/bin/bash

STEP=100

minHeight=1
maxHeight=99
json=$(curl -q 'http://127.0.0.1:46657/blockchain?minHeight='$minHeight'&maxHeight='$maxHeight)
last_height=$(echo $json | jq '.result[1].last_height')
> txs.json
while [ $maxHeight -le $last_height ]
do
    json=$(curl -s 'http://127.0.0.1:46657/blockchain?minHeight='$minHeight'&maxHeight='$maxHeight)
    for height in $(echo $json | jq '.result[1].block_metas[].header | select(.num_txs > 0) | .height')
    do
        curl -s "http://192.168.1.119:46657/get_block?height="$height | jq '.result[1]' | tee -a txs.json
    done
    minHeight=$maxHeight 
    maxHeight=$((maxHeight+STEP))
    last_height=$(echo $json | jq '.result[1].last_height')
    #echo $minHeight $maxHeight $last_height > 123.log
done

mongoimport --host 127.0.0.1 --port 3001 --db meteor -c ChainTXs --drop --jsonArray < txs.json
