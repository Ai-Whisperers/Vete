import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { WebhookEvent } from '../types';

interface WebhookConfigProps {
  // Add props if needed
}

const WebhookConfig: React.FC<WebhookConfigProps> = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [payload, setPayload] = useState<string>('');
  const [retryLogic, setRetryLogic] = useState<string>('');

  const handleEventSelection = (event: WebhookEvent) => {
    setSelectedEvent(event);
  };

  const handlePayloadPreview = async () => {
    if (selectedEvent) {
      const { data, error } = await supabase
        .from('webhooks')
        .select('payload')
        .eq('event', selectedEvent);
      if (data) {
        setPayload(JSON.stringify(data[0].payload, null, 2));
      } else {
        console.error(error);
      }
    }
  };

  const handleRetryLogic = (logic: string) => {
    setRetryLogic(logic);
  };

  const handleWebhookCreation = async () => {
    if (selectedEvent && payload && retryLogic) {
      const { data, error } = await supabase
        .from('webhooks')
        .insert([
          {
            event: selectedEvent,
            payload: JSON.parse(payload),
            retry_logic: retryLogic,
          },
        ]);
      if (data) {
        console.log('Webhook created successfully');
      } else {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <h1>Webhook Configuration</h1>
      <h2>Event Selection</h2>
      <ul>
        {events.map((event) => (
          <li key={event}>
            <button onClick={() => handleEventSelection(event)}>
              {event}
            </button>
          </li>
        ))}
      </ul>
      {selectedEvent && (
        <div>
          <h2>Payload Preview</h2>
          <button onClick={handlePayloadPreview}>Preview Payload</button>
          <pre>{payload}</pre>
          <h2>Retry Logic</h2>
          <input
            type="text"
            value={retryLogic}
            onChange={(e) => handleRetryLogic(e.target.value)}
          />
          <button onClick={handleWebhookCreation}>Create Webhook</button>
        </div>
      )}
    </div>
  );
};

export default WebhookConfig;