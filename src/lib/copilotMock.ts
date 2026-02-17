import type { CoPilotConversationContext } from '@/types/liveOps';

const SENTIMENT_LABELS: Record<string, string> = {
  positive: 'positive',
  neutral: 'neutral',
  negative: 'negative',
  frustrated: 'frustrated',
};

function getLastCustomerMessage(ctx: CoPilotConversationContext): string {
  const customerMsgs = ctx.messages.filter(m => m.role === 'customer');
  return customerMsgs.length > 0 ? customerMsgs[customerMsgs.length - 1].content : '';
}

function generateSummaryResponse(ctx: CoPilotConversationContext): string {
  const totalMsgs = ctx.messages.length;
  const customerMsgs = ctx.messages.filter(m => m.role === 'customer').length;
  const lastMsg = getLastCustomerMessage(ctx);
  const sentimentLabel = SENTIMENT_LABELS[ctx.sentiment] || ctx.sentiment;

  return `Here's a summary of this ${ctx.channel} conversation with ${ctx.customerName}:\n\n` +
    `• Topic: ${ctx.topic}\n` +
    `• Messages exchanged: ${totalMsgs} (${customerMsgs} from customer)\n` +
    `• Current sentiment: ${sentimentLabel}\n` +
    `• Handler: ${ctx.isAiHandled ? 'AI Assistant' : ctx.agentName}\n` +
    (lastMsg ? `• Last customer message: "${lastMsg.substring(0, 80)}${lastMsg.length > 80 ? '...' : ''}"` : '');
}

function generateCustomerInfoResponse(ctx: CoPilotConversationContext): string {
  if (!ctx.customerInfo) {
    return `I don't have detailed customer information available for ${ctx.customerName} at the moment.`;
  }
  const info = ctx.customerInfo;
  let response = `Here's what I know about ${ctx.customerName}:\n\n`;
  if (info.company) response += `• Company: ${info.company}\n`;
  if (info.email) response += `• Email: ${info.email}\n`;
  if (info.phone) response += `• Phone: ${info.phone}\n`;
  if (info.tier) response += `• Tier: ${info.tier.charAt(0).toUpperCase() + info.tier.slice(1)}\n`;
  if (info.lifetimeValue) response += `• Lifetime Value: ${info.lifetimeValue}\n`;
  if (info.location) response += `• Location: ${info.location}\n`;
  if (info.tags && info.tags.length > 0) response += `• Tags: ${info.tags.join(', ')}\n`;
  if (info.previousInteractions && info.previousInteractions.length > 0) {
    response += `• Previous interactions: ${info.previousInteractions.length}\n`;
    const lastInteraction = info.previousInteractions[0];
    response += `• Last interaction: ${lastInteraction.topic} (${lastInteraction.outcome}) on ${lastInteraction.date}`;
  }
  return response;
}

function generateSentimentResponse(ctx: CoPilotConversationContext): string {
  const sentimentLabel = SENTIMENT_LABELS[ctx.sentiment] || ctx.sentiment;
  const lastMsg = getLastCustomerMessage(ctx);

  let response = `The customer's current sentiment is **${sentimentLabel}**.`;

  if (ctx.sentiment === 'negative' || ctx.sentiment === 'escalated') {
    response += `\n\nRecommended approach:\n` +
      `• Acknowledge their frustration empathetically\n` +
      `• Focus on resolving the issue quickly\n` +
      `• Offer concrete next steps\n` +
      `• Consider escalating if the issue persists`;
  } else if (ctx.sentiment === 'positive') {
    response += `\n\nThe customer seems satisfied. This is a good opportunity to:\n` +
      `• Confirm the resolution\n` +
      `• Ask if there's anything else they need\n` +
      `• Thank them for their patience`;
  } else {
    response += `\n\nThe conversation appears neutral. Keep the interaction professional and solution-focused.`;
  }

  if (lastMsg) {
    response += `\n\nBased on their last message: "${lastMsg.substring(0, 60)}${lastMsg.length > 60 ? '...' : ''}"`;
  }

  return response;
}

function generateNextStepResponse(ctx: CoPilotConversationContext): string {
  const suggestions = ctx.coPilotSuggestions || [];
  const actionSuggestion = suggestions.find(s => s.type === 'action');
  const replySuggestion = suggestions.find(s => s.type === 'reply');

  let response = `Based on the current conversation context, here are my recommended next steps:\n\n`;

  if (actionSuggestion) {
    response += `1. **Action**: ${actionSuggestion.content} (${Math.round(actionSuggestion.confidence * 100)}% confidence)\n`;
  }
  if (replySuggestion) {
    response += `${actionSuggestion ? '2' : '1'}. **Suggested reply**: "${replySuggestion.content}"\n`;
  }

  if (ctx.sentiment === 'negative' || ctx.sentiment === 'escalated') {
    response += `\nGiven the ${ctx.sentiment} sentiment, I'd also recommend:\n` +
      `• Prioritize empathy in your response\n` +
      `• Offer a direct resolution path`;
  }

  if (!actionSuggestion && !replySuggestion) {
    response += `1. Review the customer's latest message carefully\n` +
      `2. Address their concern about "${ctx.topic}" directly\n` +
      `3. Provide a clear resolution or next steps`;
  }

  return response;
}

function generateHistoryResponse(ctx: CoPilotConversationContext): string {
  const interactions = ctx.customerInfo?.previousInteractions;
  if (!interactions || interactions.length === 0) {
    return `No previous interaction history is available for ${ctx.customerName}.`;
  }

  let response = `${ctx.customerName} has ${interactions.length} previous interaction(s):\n\n`;
  interactions.forEach((interaction, i) => {
    response += `${i + 1}. **${interaction.topic}** — ${interaction.outcome} (${interaction.date})`;
    if (interaction.channel) response += ` via ${interaction.channel}`;
    if (interaction.agent) response += `, handled by ${interaction.agent}`;
    response += '\n';
  });

  return response;
}

function generateGenericResponse(ctx: CoPilotConversationContext, question: string): string {
  const lastMsg = getLastCustomerMessage(ctx);
  return `Regarding your question about this conversation with ${ctx.customerName}:\n\n` +
    `This is a ${ctx.channel} conversation about "${ctx.topic}". ` +
    `The customer's sentiment is ${ctx.sentiment}. ` +
    (ctx.isAiHandled ? 'It is currently being handled by the AI Assistant. ' : `It is being handled by ${ctx.agentName}. `) +
    (lastMsg ? `\n\nThe customer's last message was: "${lastMsg.substring(0, 100)}${lastMsg.length > 100 ? '...' : ''}"` : '') +
    `\n\nCould you be more specific about what you'd like to know? I can help with:\n` +
    `• Conversation summary\n` +
    `• Customer details\n` +
    `• Sentiment analysis\n` +
    `• Suggested next steps\n` +
    `• Interaction history`;
}

export function generateCoPilotResponse(question: string, ctx: CoPilotConversationContext): string {
  const q = question.toLowerCase();

  if (q.includes('summary') || q.includes('summarize') || q.includes('overview') || q.includes('what happened') || q.includes('what\'s going on') || q.includes('brief me')) {
    return generateSummaryResponse(ctx);
  }

  if (q.includes('customer') || q.includes('who is') || q.includes('profile') || q.includes('details') || q.includes('info') || q.includes('crm') || q.includes('contact')) {
    return generateCustomerInfoResponse(ctx);
  }

  if (q.includes('sentiment') || q.includes('mood') || q.includes('feeling') || q.includes('tone') || q.includes('frustrated') || q.includes('happy') || q.includes('angry')) {
    return generateSentimentResponse(ctx);
  }

  if (q.includes('next') || q.includes('suggest') || q.includes('recommend') || q.includes('should i') || q.includes('what do i') || q.includes('how should') || q.includes('action') || q.includes('step')) {
    return generateNextStepResponse(ctx);
  }

  if (q.includes('history') || q.includes('previous') || q.includes('past') || q.includes('before') || q.includes('last time') || q.includes('prior')) {
    return generateHistoryResponse(ctx);
  }

  return generateGenericResponse(ctx, question);
}
