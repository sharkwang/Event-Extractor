/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Loader2, Calendar, Users, CheckSquare, MessageSquare } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface EventItem {
  time: string;
  participants: string[];
  description: string;
  actionItems: string[];
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Extract the main events, tasks, and discussions from the following conversation text. Format the output as a list of events.\n\nConversation:\n${inputText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              events: {
                type: Type.ARRAY,
                description: "A list of events extracted from the conversation.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: {
                      type: Type.STRING,
                      description: "The time or date the event occurred or is scheduled for, if mentioned. Otherwise, leave empty."
                    },
                    participants: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "The people involved in this event."
                    },
                    description: {
                      type: Type.STRING,
                      description: "A clear and concise description of the event, discussion, or decision."
                    },
                    actionItems: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Any specific tasks or action items resulting from this event."
                    }
                  },
                  required: ["time", "participants", "description", "actionItems"]
                }
              }
            },
            required: ["events"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setEvents(data.events || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-12 font-sans text-neutral-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            Event Extractor
          </h1>
          <p className="text-neutral-500">
            Paste your conversation transcript below to automatically extract key events, decisions, and action items.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4 flex flex-col h-full">
            <label htmlFor="conversation" className="block text-sm font-medium text-neutral-700">
              Conversation Text
            </label>
            <textarea
              id="conversation"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Alice: Let's schedule the marketing review for next Tuesday at 10 AM. Bob: Sounds good, I'll prepare the slides. Alice: Great, and can you also send the Q3 report to the team beforehand?"
              className="w-full flex-1 min-h-[400px] p-4 rounded-xl border border-neutral-200 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none outline-none transition-all"
            />
            <button
              onClick={handleExtract}
              disabled={loading || !inputText.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Events'
              )}
            </button>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4 flex flex-col h-full">
            <label className="block text-sm font-medium text-neutral-700">
              Extracted Events
            </label>
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl shadow-sm p-6 overflow-y-auto min-h-[400px]">
              {events.length === 0 && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                  <Calendar className="w-12 h-12 opacity-20" />
                  <p>No events extracted yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <div key={index} className="p-5 rounded-lg border border-neutral-100 bg-neutral-50/50 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-medium text-neutral-900 leading-snug">
                          {event.description}
                        </h3>
                        {event.time && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-neutral-200 text-xs font-medium text-neutral-600 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            {event.time}
                          </span>
                        )}
                      </div>
                      
                      {event.participants && event.participants.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Users className="w-4 h-4" />
                          <span>{event.participants.join(', ')}</span>
                        </div>
                      )}

                      {event.actionItems && event.actionItems.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-neutral-200/60">
                          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Action Items</h4>
                          <ul className="space-y-2">
                            {event.actionItems.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                <CheckSquare className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
