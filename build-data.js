const fs = require('fs');

let source = fs.readFileSync('perguntas v1.txt', 'utf8').replace(/\r/g, '');
source = source
  .replace('15.Quais são os sete dons do Espírito Santo: 1º Sabedoria,2º\nEntendimento;3º Conselho;4º Fortaleza;5º Ciência;6º Piedade;7º Temor de\nDeus.', '15. Quais são os sete dons do Espírito Santo? Resposta: Sabedoria, entendimento, conselho, fortaleza, ciência, piedade e temor de Deus.')
  .replace(/([.!?”)])(1[5-9]|20)\./g, '$1\n$2.')
  .replace('Brasileira17.', 'Brasileira\n17.')
  .replace('Neri17.', 'Neri\n17.');

const headings = ['1. Catecismo', '2. Vida dos Santos', '3. História', '4. FSSPX:', '5. Quem disse essa frase?'];
const names = ['Catecismo', 'Vida dos Santos', 'História', 'FSSPX', 'Quem disse essa frase?'];
const questions = [];

headings.forEach((heading, category) => {
  const start = source.indexOf(heading) + heading.length;
  const end = category === 4 ? source.length : source.indexOf(headings[category + 1]);
  const block = source.slice(start, end);
  const matches = [...block.matchAll(/(?:^|\n)(\d{1,2})\.\s*([\s\S]*?)(?=\n\d{1,2}\.\s*|$)/g)];
  matches.forEach((match) => {
    const cleaned = match[2].replace(/\s+/g, ' ').trim();
    const pieces = cleaned.split(/\s+R(?:esposta|eposta)::?\s*/i);
    if (pieces.length < 2) throw new Error(`Resposta não encontrada: ${names[category]} ${match[1]}`);
    questions.push({ category, categoryName: names[category], question: pieces[0].trim(), answer: pieces.slice(1).join(' Resposta: ').trim() });
  });
});

if (questions.length !== 100) throw new Error(`Esperadas 100 perguntas; encontradas ${questions.length}.`);

const catechismDistractors = [
  ['Batismo, Eucaristia, Penitência, Ordem, Matrimônio, Exorcismo e Consagração', 'Batismo, Crisma, Eucaristia, Confissão, Viático, Ordem e Profissão religiosa', 'Batismo, Confirmação, Eucaristia, Penitência, Unção, Votos e Matrimônio'],
  ['Fé, prudência e justiça', 'Esperança, fortaleza e temperança', 'Fé, humildade e obediência'],
  ['Fé, esperança, caridade e prudência', 'Justiça, humildade, obediência e castidade', 'Sabedoria, entendimento, conselho e fortaleza'],
  ['Matéria grave, escândalo público e reincidência', 'Conhecimento da lei, intenção e consequência grave', 'Tentação grave, liberdade exterior e mau exemplo'],
  ['Um espírito criado que habita temporariamente um corpo', 'Uma criatura corporal dotada apenas de inteligência', 'Uma alma racional independente da matéria e do corpo'],
  ['Foi somente um erro de julgamento sem culpa grave', 'Foi principalmente um pecado de avareza e inveja', 'Foi apenas a transgressão material do jejum'],
  ['Uma só vontade, inteiramente divina', 'Duas vontades humanas e uma divina', 'Uma vontade divina dividida entre as duas naturezas'],
  ['No monte das Oliveiras', 'No monte Tabor', 'No monte Sinai'],
  ['Todos os batizados, mesmo os separados da fé', 'Somente os membros da hierarquia e do clero', 'Apenas os fiéis que já receberam a Confirmação'],
  ['A repetição vocal de fórmulas sagradas', 'Um pedido dirigido exclusivamente aos santos', 'Uma meditação que dispensa a graça divina'],
  ['Ave Maria, cheia de graça, o Senhor é convosco', 'Santa Maria, Mãe de Deus, rogai por nós', 'Eis aqui a serva do Senhor; faça-se em mim'],
  ['Inventar publicamente uma falta inexistente do próximo', 'Julgar interiormente uma ação sem conhecer a intenção', 'Repreender com caridade um erro público diante do culpado'],
  ['Ensinar os ignorantes; corrigir os que erram; consolar os aflitos; perdoar injúrias', 'Jejuar; rezar; peregrinar; dar esmolas', 'Batizar; confessar; comungar; confirmar'],
  ['Dar alimento; dar bebida; vestir os nus; visitar os enfermos', 'Celebrar os sacramentos; pregar; catequizar; absolver', 'Oferecer incenso; fazer procissões; cantar salmos; peregrinar'],
  ['Sabedoria, fé, esperança, caridade, prudência, justiça e temperança', 'Entendimento, conselho, fortaleza, humildade, castidade, pobreza e obediência', 'Ciência, piedade, temor, mansidão, paciência, alegria e paz'],
  ['Os ricos, os poderosos, os instruídos e os honrados', 'Os que nunca sofrem, os satisfeitos, os fortes e os famosos', 'Os prudentes, os silenciosos, os solitários e os austeros'],
  ['Para cumprir literalmente quarenta horas no sepulcro', 'Porque sua alma precisava purificar-se antes de voltar ao corpo', 'Para que os discípulos pudessem completar os ritos funerários'],
  ['O Batismo, porque apaga todo pecado e abre a Igreja', 'A Ordem, porque torna possível a administração dos demais', 'A Penitência, porque restitui a graça perdida'],
  ['Oração contínua, jejum perpétuo e silêncio absoluto', 'Humildade, mansidão e caridade fraterna', 'Pobreza material, peregrinação e penitência pública'],
  ['Uma cerimônia da Igreja que recorda um fato da vida de Cristo', 'Um símbolo religioso criado pelos Apóstolos para ensinar a fé', 'Um sinal invisível da fé pessoal, sem matéria ou forma']
];

function distractors(question, index) {
  if (question.category === 0) return catechismDistractors[index];
  const pool = [...new Map(questions.filter((item) => item.category === question.category && item.answer !== question.answer).map((item) => [item.answer, item])).values()];
  const start = (index * 7 + 3) % pool.length;
  return [0, 1, 2].map((offset) => pool[(start + offset * 5) % pool.length].answer);
}

questions.forEach((question, index) => { question.options = [question.answer, ...distractors(question, index)]; });
fs.writeFileSync('questions.js', `window.QUIZ_QUESTIONS = ${JSON.stringify(questions, null, 2)};\n`);

const output = questions.map((item, index) => `${item.categoryName} — ${String((index % 20) + 1).padStart(2, '0')}\n${item.question}\nA) ${item.options[0]} [CORRETA]\nB) ${item.options[1]}\nC) ${item.options[2]}\nD) ${item.options[3]}`).join('\n\n');
fs.writeFileSync('respostasv1.txt', `${output}\n`);
console.log(`Geradas ${questions.length} perguntas com quatro alternativas.`);
