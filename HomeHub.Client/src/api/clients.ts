import { createClient, type Interceptor } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { EventService } from '../gen/events_pb';
import { QuoteService, WeatherService } from '../gen/integrations_pb';
import { ListService } from '../gen/lists_pb';
import { NoteService } from '../gen/notes_pb';
import { TaskService } from '../gen/tasks_pb';
import { UserService } from '../gen/users_pb';
import { $apiKey } from '../lib/session';

const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();
export const apiBaseUrl = (configuredBase || window.location.origin).replace(/\/$/, '');

const withApiKey: Interceptor = (next) => async (request) => {
  const apiKey = $apiKey.get();
  if (apiKey) request.header.set('x-api-key', apiKey);
  return next(request);
};

const transport = createGrpcWebTransport({
  baseUrl: apiBaseUrl,
  interceptors: [withApiKey],
});

export const eventClient = createClient(EventService, transport);
export const taskClient = createClient(TaskService, transport);
export const noteClient = createClient(NoteService, transport);
export const listClient = createClient(ListService, transport);
export const userClient = createClient(UserService, transport);
export const weatherClient = createClient(WeatherService, transport);
export const quoteClient = createClient(QuoteService, transport);

/** Probe a key before storing it, so a bad login never replaces a working session. */
export async function verifyApiKey(apiKey: string): Promise<void> {
  const probeTransport = createGrpcWebTransport({
    baseUrl: apiBaseUrl,
    interceptors: [
      (next) => async (request) => {
        request.header.set('x-api-key', apiKey);
        return next(request);
      },
    ],
  });

  await createClient(UserService, probeTransport).getCurrentUser({});
}
