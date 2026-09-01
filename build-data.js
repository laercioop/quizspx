const fs = require('fs');

const source = fs.readFileSync('respostasv-2.txt', 'utf8').replace(/\r/g, '');
const categoryHeadings = [
  '1. Catecismo',
  '2. Vida dos Santos',
  '3. História',
  '4. FSSPX',
  '5. Quem disse essa frase?'
];
const categoryNames = ['Catecismo', 'Vida dos Santos', 'História', 'FSSPX', 'Quem disse essa frase?'];
const answerKeySource = source.slice(source.indexOf('GABARITO GERAL'));
const questions = [];

function readAnswerKey(categoryIndex) {
  const escapedName = categoryNames[categoryIndex].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = answerKeySource.match(new RegExp(`${categoryIndex + 1}\\. ${escapedName}: ([^\\n]+)`));
  if (!match) throw new Error(`Gabarito não encontrado para ${categoryNames[categoryIndex]}.`);
  return [...match[1].matchAll(/\d+\-([A-D])/g)].map((item) => item[1]);
}

categoryHeadings.forEach((heading, category) => {
  const start = source.indexOf(heading) + heading.length;
  const nextHeading = categoryHeadings[category + 1];
  const end = nextHeading ? source.indexOf(nextHeading) : source.indexOf('GABARITO GERAL');
  const block = source.slice(start, end);
  const answerKey = readAnswerKey(category);
  const matches = [...block.matchAll(/(?:^|\n)(\d{1,2})\.\s+([^\n]+)\nA\)\s+([^\n]+)\nB\)\s+([^\n]+)\nC\)\s+([^\n]+)\nD\)\s+([^\n]+)/g)];

  if (matches.length !== 20 || answerKey.length !== 20) {
    throw new Error(`${categoryNames[category]}: ${matches.length} perguntas e ${answerKey.length} respostas no gabarito.`);
  }

  matches.forEach((match, index) => {
    const letters = ['A', 'B', 'C', 'D'];
    const originalOptions = match.slice(3, 7).map((option) => option.trim());
    const correctIndex = letters.indexOf(answerKey[index]);
    const answer = originalOptions[correctIndex];
    const options = [answer, ...originalOptions.filter((_, optionIndex) => optionIndex !== correctIndex)];
    questions.push({
      category,
      categoryName: categoryNames[category],
      question: match[2].trim(),
      answer,
      options
    });
  });
});

const invalid = questions.filter((item) => item.options.length !== 4 || new Set(item.options).size !== 4);
if (questions.length !== 100 || invalid.length) {
  throw new Error(`Base inválida: ${questions.length} perguntas e ${invalid.length} conjuntos de alternativas inválidos.`);
}

fs.writeFileSync('questions.js', `window.QUIZ_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`);
console.log('Geradas 100 perguntas a partir de respostasv-2.txt.');
