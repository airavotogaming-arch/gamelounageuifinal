import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUp, Headphones, LockKeyhole, MessageSquareText, RotateCcw } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import './support-chat.css';

export type SupportChatMessage = {
  id: string;
  sender: 'admin' | 'player';
  text: string;
  sentAt: string;
};

type SupportChatPanelProps = {
  messages: SupportChatMessage[];
  onSend: (text: string) => void;
  onClear: () => void;
};

const messageSchema = z.object({
  message: z.string().trim().min(1, 'Write a message before sending.').max(1000, 'Keep your message under 1,000 characters.'),
});

type MessageFormValues = z.infer<typeof messageSchema>;

function formatSentAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function SupportChatPanel({ messages, onSend, onClear }: SupportChatPanelProps) {
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { message: '' },
    mode: 'onSubmit',
  });
  const messageLength = form.watch('message')?.length ?? 0;

  const submitMessage = (values: MessageFormValues) => {
    const text = values.message.trim();
    if (!text) return;
    onSend(text);
    form.reset({ message: '' });
  };

  return (
    <section className="support-chat" aria-labelledby="support-chat-title" data-testid="panel-support-chat">
      <header className="support-chat__header">
        <div className="support-chat__heading">
          <span className="support-chat__eyebrow"><span className="support-chat__signal" /> LOCAL SUPPORT THREAD</span>
          <h2 id="support-chat-title" data-testid="text-support-chat-title">Support chat<span>.</span></h2>
          <p>A place to jot down what you need during your lounge session.</p>
        </div>
        <div className="support-chat__header-icon" aria-hidden="true"><Headphones size={21} /></div>
      </header>

      <div className="support-chat__notice" role="note" data-testid="notice-local-only">
        <LockKeyhole size={15} aria-hidden="true" />
        <p><strong>Private to this browser.</strong> Messages stay on this device and are not delivered to a real admin. Replies shown here are sample conversation content only.</p>
      </div>

      <div className="support-chat__thread-head">
        <div className="support-chat__thread-label">
          <MessageSquareText size={15} aria-hidden="true" />
          <span>Conversation</span>
          <span className="support-chat__count" data-testid="text-support-message-count">{messages.length.toString().padStart(2, '0')}</span>
        </div>
        <button
          className="support-chat__clear"
          type="button"
          onClick={onClear}
          disabled={messages.length === 0}
          data-testid="button-clear-support-chat"
        >
          <RotateCcw size={13} aria-hidden="true" /> Clear thread
        </button>
      </div>

      <div className="support-chat__messages" role="log" aria-label="Local support conversation" aria-live="polite" data-testid="list-support-chat-messages">
        {messages.length ? messages.map((message) => (
          <article
            className={`support-chat__message support-chat__message--${message.sender}`}
            key={message.id}
            data-testid={`message-support-${message.id}`}
          >
            <div className="support-chat__message-meta">
              <span className="support-chat__sender">{message.sender === 'player' ? 'You' : 'Sample guide'}</span>
              <time dateTime={message.sentAt} data-testid={`time-support-${message.id}`}>{formatSentAt(message.sentAt)}</time>
            </div>
            <p>{message.text}</p>
          </article>
        )) : (
          <div className="support-chat__empty" data-testid="empty-support-chat">
            <span className="support-chat__empty-mark"><MessageSquareText size={19} /></span>
            <strong>Your thread is clear.</strong>
            <span>Write a note below to start a local conversation.</span>
          </div>
        )}
      </div>

      <Form {...form}>
        <form className="support-chat__composer" onSubmit={form.handleSubmit(submitMessage)} data-testid="form-support-chat">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="support-chat__field">
                <FormLabel className="support-chat__composer-label">Your message</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="support-chat__textarea"
                    placeholder="Type a note about your session..."
                    maxLength={1000}
                    rows={2}
                    aria-label="Your message"
                    data-testid="input-support-chat-message"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void form.handleSubmit(submitMessage)();
                      }
                    }}
                  />
                </FormControl>
                <div className="support-chat__field-foot">
                  <FormMessage className="support-chat__error" />
                  <span className="support-chat__counter" data-testid="text-support-chat-character-count">{messageLength}/1000</span>
                </div>
              </FormItem>
            )}
          />
          <div className="support-chat__composer-foot">
            <span>Enter to send <i /> Shift + Enter for a new line</span>
            <button className="support-chat__send" type="submit" disabled={!form.watch('message')?.trim()} data-testid="button-send-support-chat">
              Send message <ArrowUp size={15} aria-hidden="true" />
            </button>
          </div>
        </form>
      </Form>
    </section>
  );
}

export default SupportChatPanel;
