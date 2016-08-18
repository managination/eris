# Adding new validator node
Excerpts from [this tutorial](https://docs.erisindustries.com/tutorials/advanced/bond-unbond/)
Creating the blockchain named "simplechain" with two Root accounts and one Full account
```bash
eris chains make --account-types=Root:2,Full:1 simplechain
```
Now making a new blockchain "bonding" based on "simplechain" and create the first node
```bash
eris chains make --chain-type=simplechain bonding
eris chains new bonding --dir ~/.eris/chains/bonding
```

Then add a new node on the same instance
```bash
addr=$(eris keys gen | tr -d "[:cntrl:]")
rm ~/.eris/chains/bonding/priv_validator.json
eris keys convert $addr > ~/.eris/chains/bonding/priv_validator.json
cp ~/.eris/chains/default/config.toml ~/.eris/chains/bonding
main_node_ip=$(eris chains inspect bonding NetworkSettings.IPAddress)
sed -i "s/^seeds = .*/seeds = ${main_node_ip}:46657/" ~/.eris/chains/bonding/config.toml
```
Connect the new peer node named "bonding2"
```bash
eris chains new bonding2 --dir ~/.eris/chains/bonding --publish --env CHAIN_ID=bonding
```
Send tokens from our current validator account to new account
```bash
addr_machine=$(cut -d, -f 1 ~/.eris/chains/bonding/addresses.csv)
eris chains exec bonding "mintx send --amt 200000 --to $addr --addr $addr_machine --chainID bonding --node-addr=${main_node_ip}:46657 --sign-addr=keys:4767 --sign --broadcast"
```
Now we need to create a bond form new validatod to old one
```bash
pub_new=$(eris keys pub $addr | tr -d "[:cntrl:]")
new_node_ip=$(eris chains inspect bonding2 NetworkSettings.IPAddress)
eris chains exec bonding2 "mintx bond --amt 150000 --pubkey $pub_new --to $addr --chainID bonding --node-addr=${new_node_ip}:46657 --sign-addr=keys:4767 --sign --broadcast"
```


# To delete a running chain
```bash
 eris chains rm --data --dir --file -f demo
```
