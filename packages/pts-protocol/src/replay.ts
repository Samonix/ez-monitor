import { readFile } from 'node:fs/promises';

const [fixturePath, target = 'http://127.0.0.1:3000/pts/jsonPTS'] = process.argv.slice(2);
if (!fixturePath) {
  console.error('Вкажи шлях до fixture JSON: pnpm pts:replay packages/pts-protocol/fixtures/upload-status.json');
  process.exit(1);
}

const payload = await readFile(fixturePath, 'utf8');
const auth = Buffer.from(`${process.env.PTS_HTTP_BASIC_USER ?? 'admin'}:${process.env.PTS_HTTP_BASIC_PASSWORD ?? 'admin'}`).toString('base64');
const response = await fetch(target, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8', authorization: `Basic ${auth}` }, body: payload });
console.log(response.status, await response.text());