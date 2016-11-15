import { Random } from 'meteor/random'

import { ChainTXs } from '../imports/api/common.js';

fs = Npm.require( 'fs' );

// Home directory where all fil
HOME = '/home/eris';
ERIS_DIR = HOME + '/.eris';

logger = Npm.require('winston');
logger.level = 'debug';

// Make sure that we can user eris
fs.accessSync('/usr/bin/eris');
// Make sure that we are ready to work with chain
fs.accessSync(ERIS_DIR);

function shell_exec(command) {
    logger.debug('Running shell_exec ' + command)
    exec = Npm.require('child_process').exec;
    Future = Npm.require("fibers/future");

    var fut = new Future();
    exec(command, function(err, stdout, stderr) {
      fut['return']([err, stdout, stderr]);
    });

    [err, stdout, stderr] = fut.wait()

    if(err) {
        logger.error('Error running ' + command);
        logger.error('Err: ' + err);
        logger.error('stdout: ' + stdout);
        logger.error('stderr: ' + stderr);
        throw new Meteor.Error(500, 'error!');
    }
    return stdout;
}

function getChainName(node) {
    chain = node.Info.Config.Env.filter(function(env_var){
        return env_var.startsWith('CHAIN_ID=') && !env_var.endsWith(node.ShortName);
    });
    if (chain.length == 0) {
        chain = node.Info.Config.Env.filter(function(env_var){
            return env_var.startsWith('CHAIN_ID='); 
        });
    }
    chain = chain[0].split('=')[1];
    return chain
}

function getAccounts() {
    let accounts = [];

    fs.readdirSync(ERIS_DIR+'/chains/account-types').forEach(account => {
        accounts.push(account.split('.')[0]);
    });
    logger.debug('Accounts: ' + accounts);
    return accounts;
}

Meteor.publish('ChainTXs', function() {
    return ChainTXs.find();
});

Meteor.publish('chains', function() {
    let publication = this;
    let chains = [];

    let nodes = JSON.parse(shell_exec('eris chains ls --json'));

    nodes.forEach(node => {
        chains.push(getChainName(node));
    });

    chains = chains.filter(function (value, index, self) { 
        // leave only list of unique chain names
        // from http://stackoverflow.com/questions/1960473/unique-values-in-an-array/14438954#14438954
        return self.indexOf(value) === index;
    });

    my_nodes = [];

    nodes.forEach(node => {
        if ("Running" in node.Info.State) {
            state = 'Running';
            icon = 'ok';
            rpc_port = node.Info.NetworkSettings.Ports['46657/tcp'][0]['HostPort'];
        } else {
            state = 'Not started';
            icon = 'remove';
            rpc_port = null;
        }

        my_nodes.push({
            name: node.ShortName,
            state: state,
            icon: icon,
            chain: getChainName(node),
            rpc_port: rpc_port
        });
    });

    chains.forEach(chain => {
        chain_nodes = my_nodes.filter(function(node){
            return node.chain === chain;
        });

        chain = {
            name: chain,
            nodes: chain_nodes
        };
        publication.added('chains', Random.id(), chain);
    });
    publication.ready();
});

/*
Meteor.publish('eris_nodes', function() {
    let publication = this;

    nodes.forEach(node => {
        let name = node.ShortName
        if ("Running" in node.Info.State) {
            on = 'Running';
            css_class = 'text-success';
        } else {
            on = 'Not started';
            css_class = 'text-danger';
        }
        chain = getChainName(node);

        let data = { eris_node: {
            name: name,
            on: on,
            css_class: css_class,
            chain: chain
        }}
        publication.added('eris_nodes', Random.id(), data);
    });

    publication.ready();
});
*/

Meteor.publish('eris_node_types', function() {
    let publication = this;

    getAccounts().forEach(account_type => {
        type = { eris_node_type: account_type }
        publication.added('eris_node_types', Random.id(), type);
    });

    publication.ready();
});

///////////////////////////////////////////////////////////////////////////////

Meteor.methods({
    'eris.chains.new'(name, chain, coins) {
        shell_exec(HOME+'/eris/eris_gui/server/new_node.sh ' + [name, chain, coins].join(' '));
    },

    'eris.chains.make'(name) {
        shell_exec(HOME+'/eris/eris_gui/server/new_node.sh ' + name);
    },

    'eris.chains.start'(name) {
        logger.debug('eris chains start ' + name);
        shell_exec('eris chains start ' + name);
    },

    'eris.chains.stop'(name) {
        logger.debug('eris chains stop ' + name);
        shell_exec('eris chains stop ' + name);
    },

    'eris.chains.delete'(name) {
        logger.debug('eris chains rm -f --data ' + name);
        shell_exec('eris chains rm -f --data ' + name);
    },
})
