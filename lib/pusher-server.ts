import Pusher from 'pusher';

// Initialize Pusher server instance
const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export default pusherServer;

/**
 * Trigger a real-time event to all subscribers
 * @param channel - Channel name (e.g., "vault-123")
 * @param event - Event name (e.g., "source-added")
 * @param data - Event payload
 */
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channel, event, data);
    console.log(`[Pusher] Triggered ${event} on ${channel}`);
  } catch (error) {
    console.error('[Pusher] Error triggering event:', error);
    throw error;
  }
}
