import { Mongo } from 'meteor/mongo';

ErisNodes = new Meteor.Collection('eris_nodes');
ErisNodeTypes = new Meteor.Collection('eris_node_types');
export const Chains = new Meteor.Collection('chains');

export const ChainTXs = new Mongo.Collection('ChainTXs');
