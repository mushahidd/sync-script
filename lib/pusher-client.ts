import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

/**
 * Get or create Pusher client instance
 * Singleton pattern to avoid multiple connections
 */
export function getPusherClient(): Pusher {
  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

/**
 * Subscribe to a channel and listen for events
 * @param channelName - Channel to subscribe to
 * @param eventName - Event to listen for
 * @param callback - Function to call when event is received
 */
export function subscribeToChannel(
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) {
  const pusher = getPusherClient();
  const channel = pusher.subscribe(channelName);
  
  channel.bind(eventName, callback);

  // Return unsubscribe function for cleanup
  return () => {
    channel.unbind(eventName, callback);
    pusher.unsubscribe(channelName);
  };
}
