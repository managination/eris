#!/bin/bash

set -xe

function main() {

    LOG_FILE="$0.log"
    [ -f ${LOG_FILE} ] && rm -fv ${LOG_FILE}
    exec >  >(tee -a ${LOG_FILE} )
    exec 2> >(tee -a ${LOG_FILE} >&2)
    echo
    echo
    echo
    echo '==============================================================================='
    echo
    date
    echo

    node_name=$1
    chain_name=$2
    coins_amount=$3

    # if only one argument
    if [ -z $chain_name ]; then
        chain_name="$node_name"
        new_blockchain "$chain_name"
        exit 0
    fi

    if [ -d $HOME/.eris/chains/"$chain_name" ]; then
        new_validator "$node_name" "$chain_name" "$coins_amount"
    else
        echo "$HOME/.eris/chains/$chain_name"  does not exist
        exit 1
    fi
}

function create_new_node() {
    node_name=$1
    chain_name=$2
    dir=$3

    eris chains new $node_name --dir $dir --publish --env CHAIN_ID=$chain_name
    eris chains stop $node_name
    eris data exec $node_name -- rm -rf /home/eris/.eris/chains/$chain_name
    eris data exec $node_name -- mv /home/eris/.eris/chains/$node_name /home/eris/.eris/chains/$chain_name
    eris chains start $node_name
}

function new_blockchain() {
    chain_name=$1
    #TODO prevent same chain creation

    [ ! -d $HOME/.eris/chains/simplechain ] && eris chains make --account-types=Root:2,Full:1 simplechain
    eris chains make --chain-type=simplechain $chain_name
    
    create_new_node "${chain_name}_main" "$chain_name" "$chain_name"
}

function new_validator() {
    #TODO prevent same node creation
    node_name=$1
    chain_name=$2
    coins_amount=$3

    chain_dir="$HOME/.eris/chains/${chain_name}"
    
    addr=$(eris keys gen | tr -d "[:cntrl:]")
    rm $HOME/.eris/chains/$chain_name/priv_validator.json
    eris keys convert $addr > $HOME/.eris/chains/$chain_name/priv_validator.json
    
    main_node_ip=$(eris chains inspect ${chain_name}_main NetworkSettings.IPAddress)
    
    cat $HOME/.eris/chains/default/config.toml | sed -e 's/seeds.*$/seeds = "'"$main_node_ip:46656"'"/g; s/moniker.*$/moniker = "'"$node_name"'"/g; s/fast_sync.*$/fast_sync = true/g' > "$chain_dir/config.toml"
    
    create_new_node "$node_name" "$chain_name" "$chain_dir" 
    echo "$node_name created in $chain_name"
    
    addr_new=$addr
    main_node_addr=$(cut -d, -f 1 "$HOME/.eris/chains/$chain_name/addresses.csv")
    
    eris chains exec $node_name "mintx send --amt $coins_amount --to $addr_new --addr $main_node_addr --chainID $chain_name --node-addr=${main_node_ip}:46657 --sign-addr=keys:4767 --sign --broadcast"
    #echo "$node_name received $coins_amount $chain_name"
    #
    #pub_from=$(eris keys pub $addr_new | tr -d "[:cntrl:]")
    #new_node_ip=$(eris chains inspect $node_name NetworkSettings.IPAddress)
    #bond_amount=150000
    #eris chains exec $node_name "mintx bond --amt $bond_amount --pubkey $pub_from --to $addr_new --chainID $chain_name --node-addr=${new_node_ip}:46657 --sign-addr=keys:4767 --sign --broadcast"
    #echo "$node_name crated a bond $coins_amount"
    #
    #echo ''
}

main "$@"
