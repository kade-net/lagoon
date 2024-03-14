export enum PostHogEvents {
   START_GRPC_WORKER = 'start-grpc-worker', 
   GRPC_WORKER_ERROR = 'grpc-worker-error',
   GRPC_READ_PROCESSOR = 'grpc-read-processor',
   GRPC_WORKER = 'grpc-worker',
   GRPC_WORKER_STREAM = 'grpc-stream',
   GRPC_WORKER_STREAM_ERROR = 'grpc-worker-stream-error',
   GRPC_WORKER_STREAM_STATUS = 'grpc-worker-stream-status',
   REPLICATE_WORKER_ACCOUNT_PLUGIN = 'replicate-worker-account-plugin',
   REPLICATE_WORKER_ACCOUNT_PLUGIN_ERROR = 'replicate-worker-account-plugin-error'
};

export const PostHogAppId = 'kade-network-app';