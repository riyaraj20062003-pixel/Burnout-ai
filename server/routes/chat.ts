import type { RequestHandler } from "express";
import type {
  ChatMessage,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatTopic,
} from "../../shared/api";
import { chatMessageRequestSchema } from "../../shared/validators";
import { failure, success } from "../lib/http";

const defaultSuggestions = [
  "Give me a 3-minute breathing reset",
  "How can I improve sleep tonight?",
  "Help me plan focused study blocks",
];

function detectTopic(text: string): ChatTopic {
  const message = text.toLowerCase();

  if (/(stress|overwhelm|anx|panic|pressure)/.test(message)) {
    return "stress";
  }

  if (/(sleep|tired|insomnia|rest|fatigue)/.test(message)) {
    return "sleep";
  }

  if (/(study|focus|pomodoro|deadline|exam)/.test(message)) {
    return "study";
  }

  return "general";
}

function buildReply(topic: ChatTopic, message: string): ChatMessageResponse {
  if (topic === "stress") {
    return {
      topic,
      reply:
        "I hear you. Stress usually drops faster with a short reset than with more pressure. Try this now: inhale 4 seconds, hold 4, exhale 6 for 8 cycles. After that, pick one task that takes under 15 minutes and complete only that.",
      suggestions: [
        "Start guided breathing now",
        "Create a low-pressure 15 minute task",
        "Message mentor for support",
      ],
    };
  }

  if (topic === "sleep") {
    return {
      topic,
      reply:
        "Sleep quality drives your burnout trend. For tonight, avoid screens 30 minutes before bed, keep room cool and dark, and set a fixed wake-up time. Even one consistent night can reduce next-day stress.",
      suggestions: [
        "Give me a 30-minute wind-down plan",
        "Suggest a no-phone bedtime routine",
        "How much sleep should I target?",
      ],
    };
  }

  if (topic === "study") {
    return {
      topic,
      reply:
        "Let's make studying sustainable: use 25/5 focus cycles and stop after four cycles for a longer break. Prioritize the highest-weight assignment first, then one easy win to maintain momentum.",
      suggestions: [
        "Start a pomodoro now",
        "Help me prioritize today",
        "Reduce procrastination plan",
      ],
    };
  }

  return {
    topic,
    reply:
      "Thanks for sharing. I can help with stress, sleep, and study balance. Tell me what feels hardest right now and I will give you a focused next step.",
    suggestions: defaultSuggestions,
  };
}

export const handleChatMessage: RequestHandler = (req, res) => {
  const parsed = chatMessageRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json(
      failure("VALIDATION_ERROR", "Invalid chat message payload", {
        issues: parsed.error.issues,
      }),
    );
    return;
  }

  const body = parsed.data as ChatMessageRequest;
  const response = buildReply(detectTopic(body.message), body.message);

  res.status(200).json(success(response));
};

export const handleChatHistory: RequestHandler = (_req, res) => {
  const now = new Date();
  const messages: ChatMessage[] = [
    {
      id: "seed-assistant-1",
      role: "assistant",
      topic: "general",
      content:
        "Hi, I am Lisa. I can help with stress, sleep, and study planning. What would you like to work on first?",
      createdAt: now.toISOString(),
    },
  ];

  res.status(200).json(success(messages));
};
