// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var events_pb = require('./events_pb.js');

function serialize_events_Event(arg) {
  if (!(arg instanceof events_pb.Event)) {
    throw new Error('Expected argument of type events.Event');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_events_Event(buffer_arg) {
  return events_pb.Event.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_events_EventRequest(arg) {
  if (!(arg instanceof events_pb.EventRequest)) {
    throw new Error('Expected argument of type events.EventRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_events_EventRequest(buffer_arg) {
  return events_pb.EventRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_events_EventsRequest(arg) {
  if (!(arg instanceof events_pb.EventsRequest)) {
    throw new Error('Expected argument of type events.EventsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_events_EventsRequest(buffer_arg) {
  return events_pb.EventsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var TunnelServiceService = exports.TunnelServiceService = {
  getTunnelEvents: {
    path: '/TunnelService/GetTunnelEvents',
    requestStream: false,
    responseStream: true,
    requestType: events_pb.EventsRequest,
    responseType: events_pb.Event,
    requestSerialize: serialize_events_EventsRequest,
    requestDeserialize: deserialize_events_EventsRequest,
    responseSerialize: serialize_events_Event,
    responseDeserialize: deserialize_events_Event,
  },
  getTunnelEvent: {
    path: '/TunnelService/GetTunnelEvent',
    requestStream: false,
    responseStream: false,
    requestType: events_pb.EventRequest,
    responseType: events_pb.Event,
    requestSerialize: serialize_events_EventRequest,
    requestDeserialize: deserialize_events_EventRequest,
    responseSerialize: serialize_events_Event,
    responseDeserialize: deserialize_events_Event,
  },
};

exports.TunnelServiceClient = grpc.makeGenericClientConstructor(TunnelServiceService);
