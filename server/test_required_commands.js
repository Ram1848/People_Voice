import { parseCommand } from './services/commandParser.js';

const tests = [
  'Add 20 bags of rice',
  'Remove 5 bags of rice',
  'How much rice do I have?',
  "What's running low?",
  'What should I reorder?',
  'Rice 20 bags add cheyyi',
  'Remove 100 bags of rice',
  'What changed today?',
  '5 kg sugar remove cheyyi',
  'Rice ni add cheyyi',
  'Rice ni 5 bags remove cheyyi',
  'Rice entha undi',
  'Em stock takkuvaga undi',
  'Em konali?',
  'Rice stock ela undi?'
];

for (const t of tests) {
  const p = parseCommand(t, ['Rice', 'Sugar']);
  console.log(
    t.padEnd(30),
    '-> act:', String(p.action).padEnd(14),
    'prod:', String(p.product).padEnd(8),
    'qty:', String(p.quantity).padEnd(6),
    'unit:', String(p.unit).padEnd(6),
    'conf:', String(p.confidence).padEnd(5),
    'reqConf:', p.requiresConfirmation
  );
}
