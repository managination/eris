import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';

import {ChainTXs} from '../api/common.js';
import {Chains} from '../api/common.js';

import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    Meteor.subscribe('chains');
    Meteor.subscribe('eris_nodes');
    Meteor.subscribe('eris_node_types');
    Meteor.subscribe('ChainTXs');

});
Template.eris_transactions.onCreated(function bodyOnCreated() {
    this.tx_filter = new ReactiveDict();
});

Template.body.helpers({
    chains() {
        return Chains.find();
    },
    host: location.host,
});

Template.eris_transactions.helpers({
    transactions() {
        const instance = Template.instance();
        const chain = instance.tx_filter.get('chain');
        const from = instance.tx_filter.get('from');
        const to = instance.tx_filter.get('to');
        // let data = ChainTXs.find({});
        // if (chain) {
        //     data = ChainTXs.find({"block.header.chain_id": chain});
        // } else if (from) {
        //     console.log(from);
        //     data = ChainTXs.find({'block.data.txs': {"$elemMatch": {"$elemMatch": {'inputs.address': from}}}});
        //     console.log(data);
        // } else if (chain && from) {
        //     data = ChainTXs.find({"block.header.chain_id": chain, "txs.1.inputs.0.address": from});
        // } else if (to) {
        //     data = ChainTXs.find({"txs.1.outputs.0.address": to});
        // } else if (chain && to) {
        //     data = ChainTXs.find({"block.header.chain_id": chain, "txs.1.outputs.0.address": to});
        // } else if (from && to) {
        //     data = ChainTXs.find({"txs.1.inputs.0.address": from, "txs.1.outputs.0.address": to});
        // } else if (chain && from && to) {
        //     data = ChainTXs.find({
        //         "block.header.chain_id": chain,
        //         "txs.1.inputs.0.address": from,
        //         "txs.1.outputs.0.address": to
        //     });
        // } else {
        //     data = ChainTXs.find({});
        // }

        let data = ChainTXs.find({'block.data.txs': {$elemMatch: {$elemMatch: {$eq: 1}}}}).fetch();
        if (chain) {
            data = data.filter(elem => {
                return elem.block.header.chain_id == chain;
            });
        }
        if (from) {
            data = data.filter(elem=> {
                for (let i = 0; i < elem.block.data.txs.length; i++) {
                    return elem.block.data.txs[i][1].inputs[0].address == from;
                }
            });
        }
        if (to) {
            data = data.filter(elem=> {
                for (let i = 0; i < elem.block.data.txs.length; i++) {
                    return elem.block.data.txs[i][1].outputs[0].address == to;
                }
            });
        }
        return data;
    },
});

Template.node.helpers({
    gui_domain: location.hostname
});

Template.chain.helpers({
    eris_nodes() {
        return ErisNodes.find();
    }
});

Template.new_node.helpers({
    eris_node_types() {
        return ErisNodeTypes.find();
    },
});


Template.new_node.events({
    'submit'(event) {
        // Prevent default browser form submit
        //event.preventDefault();

        // Get value from form element
        const target = event.target;
        const name = target.name.value;
        const chain = target.chain.value;
        const coins = target.coins.value;

        Meteor.call('eris.chains.new', name, chain, coins)

        // Clear form
        //target.text.value = '';
    },
});

Template.new_blockchain.events({
    'submit'(event) {
        // Prevent default browser form submit
        //event.preventDefault();

        // Get value from form element
        const target = event.target;
        const name = target.name.value;

        Meteor.call('eris.chains.make', name);

        // Clear form
        //target.text.value = '';
    },
});

Template.chain.events({
    'click .btn'(event) {
        Meteor.call('eris.chains.' + event.target.name, event.target.value);
    },
});

Template.eris_transactions.events({
    'submit #filter-tx'(event, instance) {
        event.preventDefault();
        instance.tx_filter.set('chain', event.target.chain.value);
        instance.tx_filter.set('from', event.target.sender.value);
        instance.tx_filter.set('to', event.target.receiver.value);
    },
});


Template.registerHelper('isRunning', function (state) {
    return state == "Running";
});
